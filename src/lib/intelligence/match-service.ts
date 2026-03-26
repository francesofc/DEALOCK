/**
 * ============================================
 * DEALOCK MATCH SERVICE — PHASE 1 IMPLEMENTATION
 * ============================================
 * 
 * Manual-triggered automatic match generation.
 * Generates match_opportunities from buyers, mandates, and sellers.
 * 
 * Phase 1 Scope:
 * - Manual trigger only (not background/cron)
 * - Simple deterministic rules
 * - Duplicate prevention via composite key
 * - Mandate priority over sellers
 * - Minimum threshold: 50 (fair matches and above)
 */

import { Buyer, Mandate, Lead, MatchOpportunity, FinanceProfile, TargetType } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import {
  MatchEngine,
  BuyerMatchCriteria,
  PropertyMatchCriteria,
  buyerToMatchCriteria,
  mandateToPropertyCriteria,
  sellerToPropertyCriteria,
  analysisToMatchOpportunity,
  MatchAnalysisResult,
} from './match-engine';

// ============================================
// SERVICE RESULT TYPES
// ============================================

export interface MatchGenerationResult {
  analyzed: number;      // Total buyer-property combinations analyzed
  created: number;       // New match_opportunities created
  skipped: number;       // Duplicates skipped
  blocked: number;       // Below threshold or had blocking issues
  errors: number;        // Errors during processing
  details: {
    mandates: number;    // Matches against mandates
    sellers: number;     // Matches against sellers (no mandate)
  };
}

export interface MatchServiceConfig {
  // Minimum score to create a match opportunity
  minScoreThreshold: number;
  
  // Whether to include sellers without mandates
  includeSellers: boolean;
  
  // Whether to skip matches with blocking issues
  skipIfBlocking: boolean;
  
  // Batch size for processing (prevent memory issues)
  batchSize: number;
}

export const DEFAULT_SERVICE_CONFIG: MatchServiceConfig = {
  minScoreThreshold: 50,  // Only fair, good, excellent matches
  includeSellers: true,   // Include pre-mandate sellers
  skipIfBlocking: false,  // Include matches with blockers (marked accordingly)
  batchSize: 100,         // Process in batches
};

// ============================================
// MATCH SERVICE CLASS
// ============================================

export class MatchService {
  private engine: MatchEngine;
  private config: MatchServiceConfig;
  private supabase = createClient();
  private workspaceId: string | null;

  constructor(
    config: Partial<MatchServiceConfig> = {},
    engine?: MatchEngine,
    workspaceId?: string | null
  ) {
    this.config = { ...DEFAULT_SERVICE_CONFIG, ...config };
    this.engine = engine || new MatchEngine();
    this.workspaceId = workspaceId || null;
  }

  /**
   * Main entry point: Generate matches for all buyers against all properties
   * This is the manual trigger function
   * Requires workspaceId to be set for data isolation
   */
  async generateMatches(workspaceId?: string): Promise<MatchGenerationResult> {
    const effectiveWorkspaceId = workspaceId || this.workspaceId;
    
    if (!effectiveWorkspaceId) {
      console.error('[MatchService] Cannot generate matches: workspace_id is required');
      throw new Error('Workspace ID is required for match generation');
    }
    const result: MatchGenerationResult = {
      analyzed: 0,
      created: 0,
      skipped: 0,
      blocked: 0,
      errors: 0,
      details: { mandates: 0, sellers: 0 },
    };

    try {
      // 1. Load all reference data (filtered by workspace)
      console.log('[MatchService] Loading reference data for workspace:', effectiveWorkspaceId);
      const { buyers, mandates, sellers, financeMap } = await this.loadReferenceData(effectiveWorkspaceId);

      console.log(`[MatchService] Loaded: ${buyers.length} buyers, ${mandates.length} mandates, ${sellers.length} sellers`);

      // 2. Build property criteria list (mandates first, then sellers)
      const properties: PropertyMatchCriteria[] = [];
      
      // Add mandates (higher priority)
      for (const mandate of mandates) {
        const seller = sellers.find(s => s.id === mandate.lead_id);
        properties.push(mandateToPropertyCriteria(mandate, seller));
      }

      // Add sellers without mandates (if enabled)
      if (this.config.includeSellers) {
        const mandatedSellerIds = new Set(mandates.map(m => m.lead_id));
        const sellersWithoutMandate = sellers.filter(s => !mandatedSellerIds.has(s.id));
        
        for (const seller of sellersWithoutMandate) {
          properties.push(sellerToPropertyCriteria(seller));
        }
      }

      console.log(`[MatchService] Total properties to match: ${properties.length}`);

      // 3. Load existing matches for duplicate check
      const existingMatches = await this.loadExistingMatchKeys();
      console.log(`[MatchService] Existing matches loaded: ${existingMatches.size}`);

      // 4. Process each buyer
      const matchesToCreate: Array<{
        opportunity: Omit<MatchOpportunity, 'id' | 'created_at' | 'updated_at'>;
        targetType: TargetType;
      }> = [];

      for (const buyer of buyers) {
        // Skip inactive buyers
        if (buyer.status === 'inactive' || buyer.status === 'closed') {
          continue;
        }

        // Get finance readiness for this buyer
        const finance = financeMap.get(buyer.id);
        const financeReadiness = this.mapFinanceStatus(finance?.status);
        
        // Convert to match criteria
        const buyerCriteria = buyerToMatchCriteria(buyer, financeReadiness);

        // Generate matches for this buyer
        const buyerMatches = this.engine.generateMatchesForBuyer(buyerCriteria, properties);

        for (const { property, analysis } of buyerMatches) {
          result.analyzed++;

          // Check score threshold
          if (analysis.score < this.config.minScoreThreshold) {
            result.blocked++;
            continue;
          }

          // Check for blocking issues
          const hasBlockers = analysis.blockers.some(b => b.severity === 'blocking');
          if (hasBlockers && this.config.skipIfBlocking) {
            result.blocked++;
            continue;
          }

          // Find the original mandate/seller ID
          const targetInfo = this.findTargetId(property, mandates, sellers);
          if (!targetInfo) {
            result.errors++;
            continue;
          }

          // Check for duplicate
          const matchKey = `${buyer.id}:${targetInfo.type}:${targetInfo.id}`;
          if (existingMatches.has(matchKey)) {
            result.skipped++;
            continue;
          }

          // Build match opportunity
          const opportunity = analysisToMatchOpportunity(
            buyer.id,
            targetInfo.type,
            targetInfo.id,
            analysis
          );

          matchesToCreate.push({ opportunity, targetType: targetInfo.type });

          // Track stats
          if (targetInfo.type === 'mandate') {
            result.details.mandates++;
          } else {
            result.details.sellers++;
          }
        }
      }

      console.log(`[MatchService] Matches to create: ${matchesToCreate.length}`);

      // 5. Batch insert matches
      if (matchesToCreate.length > 0) {
        const created = await this.insertMatches(matchesToCreate.map(m => m.opportunity), effectiveWorkspaceId);
        result.created = created;
      }

      console.log('[MatchService] Generation complete:', result);
      return result;

    } catch (error) {
      console.error('[MatchService] Fatal error during generation:', error);
      throw error;
    }
  }

  /**
   * Generate matches for a specific buyer only
   * Automatically filters by the buyer's workspace
   */
  async generateMatchesForBuyer(buyerId: string): Promise<MatchGenerationResult> {
    const result: MatchGenerationResult = {
      analyzed: 0,
      created: 0,
      skipped: 0,
      blocked: 0,
      errors: 0,
      details: { mandates: 0, sellers: 0 },
    };

    try {
      // Load specific buyer with workspace
      const { data: buyerData, error: buyerError } = await this.supabase
        .from('buyers')
        .select('*, workspace_id')
        .eq('id', buyerId)
        .single();

      if (buyerError || !buyerData) {
        throw new Error(`Buyer not found: ${buyerId}`);
      }

      const buyer = buyerData as Buyer;
      
      // Require workspace_id for data isolation
      if (!buyer.workspace_id) {
        console.error(`[MatchService] Buyer ${buyerId} has no workspace_id`);
        throw new Error('Buyer must have a workspace_id for match generation');
      }
      
      console.log(`[MatchService] Generating matches for buyer ${buyerId} in workspace ${buyer.workspace_id}`);
      
      // Load finance profile
      const { data: financeData } = await this.supabase
        .from('finance_profiles')
        .select('*')
        .eq('buyer_id', buyerId)
        .single();
      
      const finance = financeData as FinanceProfile | null;
      const financeReadiness = this.mapFinanceStatus(finance?.status);
      const buyerCriteria = buyerToMatchCriteria(buyer, financeReadiness);

      // Load properties filtered by buyer's workspace
      const { data: mandatesData } = await this.supabase
        .from('mandates')
        .select('*')
        .eq('workspace_id', buyer.workspace_id);
      const mandates = (mandatesData || []) as Mandate[];

      const { data: sellersData } = await this.supabase
        .from('leads')
        .select('*')
        .eq('workspace_id', buyer.workspace_id);
      const sellers = (sellersData || []) as Lead[];

      console.log(`[MatchService] Loaded ${mandates.length} mandates and ${sellers.length} sellers from workspace ${buyer.workspace_id}`);

      // Build properties
      const properties: PropertyMatchCriteria[] = [];
      for (const mandate of mandates) {
        const seller = sellers.find(s => s.id === mandate.lead_id);
        properties.push(mandateToPropertyCriteria(mandate, seller));
      }

      if (this.config.includeSellers) {
        const mandatedSellerIds = new Set(mandates.map(m => m.lead_id));
        const sellersWithoutMandate = sellers.filter(s => !mandatedSellerIds.has(s.id));
        for (const seller of sellersWithoutMandate) {
          properties.push(sellerToPropertyCriteria(seller));
        }
      }

      // Load existing matches for this buyer (workspace isolation via buyer_id)
      const existingMatches = await this.loadExistingMatchKeysForBuyer(buyerId);

      // Generate matches
      const matchesToCreate: Array<Omit<MatchOpportunity, 'id' | 'created_at' | 'updated_at'>> = [];
      const buyerMatches = this.engine.generateMatchesForBuyer(buyerCriteria, properties);

      for (const { property, analysis } of buyerMatches) {
        result.analyzed++;

        if (analysis.score < this.config.minScoreThreshold) {
          result.blocked++;
          continue;
        }

        const targetInfo = this.findTargetId(property, mandates, sellers);
        if (!targetInfo) {
          result.errors++;
          continue;
        }

        const matchKey = `${buyer.id}:${targetInfo.type}:${targetInfo.id}`;
        if (existingMatches.has(matchKey)) {
          result.skipped++;
          continue;
        }

        const opportunity = analysisToMatchOpportunity(
          buyer.id,
          targetInfo.type,
          targetInfo.id,
          analysis
        );

        matchesToCreate.push(opportunity);

        if (targetInfo.type === 'mandate') {
          result.details.mandates++;
        } else {
          result.details.sellers++;
        }
      }

      if (matchesToCreate.length > 0) {
        const created = await this.insertMatches(matchesToCreate, buyer.workspace_id);
        result.created = created;
      }

      return result;

    } catch (error) {
      console.error(`[MatchService] Error generating matches for buyer ${buyerId}:`, error);
      throw error;
    }
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private async loadReferenceData(workspaceId: string): Promise<{
    buyers: Buyer[];
    mandates: Mandate[];
    sellers: Lead[];
    financeMap: Map<string, FinanceProfile>;
  }> {
    const [buyersResult, mandatesResult, sellersResult, financeResult] = await Promise.all([
      this.supabase.from('buyers').select('*').eq('workspace_id', workspaceId),
      this.supabase.from('mandates').select('*').eq('workspace_id', workspaceId),
      this.supabase.from('leads').select('*').eq('workspace_id', workspaceId),
      this.supabase.from('finance_profiles').select('*'),
    ]);

    if (buyersResult.error) throw buyersResult.error;
    if (mandatesResult.error) throw mandatesResult.error;
    if (sellersResult.error) throw sellersResult.error;
    // Finance profiles may be empty, that's ok

    const buyers = (buyersResult.data || []) as Buyer[];
    const mandates = (mandatesResult.data || []) as Mandate[];
    const sellers = (sellersResult.data || []) as Lead[];
    const financeProfiles = (financeResult.data || []) as FinanceProfile[];

    // Build finance map
    const financeMap = new Map<string, FinanceProfile>();
    for (const fp of financeProfiles) {
      financeMap.set(fp.buyer_id, fp);
    }

    return { buyers, mandates, sellers, financeMap };
  }

  private async loadExistingMatchKeys(): Promise<Set<string>> {
    const { data, error } = await this.supabase
      .from('match_opportunities')
      .select('buyer_id, target_type, target_id');

    if (error) {
      console.error('[MatchService] Error loading existing matches:', error);
      return new Set();
    }

    const keys = new Set<string>();
    for (const match of (data || []) as Array<{ buyer_id: string; target_type: string; target_id: string }>) {
      const key = `${match.buyer_id}:${match.target_type}:${match.target_id}`;
      keys.add(key);
    }

    return keys;
  }

  private async loadExistingMatchKeysForBuyer(buyerId: string): Promise<Set<string>> {
    const { data, error } = await this.supabase
      .from('match_opportunities')
      .select('buyer_id, target_type, target_id')
      .eq('buyer_id', buyerId);

    if (error) {
      console.error('[MatchService] Error loading existing matches:', error);
      return new Set();
    }

    const keys = new Set<string>();
    for (const match of (data || []) as Array<{ buyer_id: string; target_type: string; target_id: string }>) {
      const key = `${match.buyer_id}:${match.target_type}:${match.target_id}`;
      keys.add(key);
    }

    return keys;
  }

  private findTargetId(
    property: PropertyMatchCriteria,
    mandates: Mandate[],
    sellers: Lead[]
  ): { type: TargetType; id: string } | null {
    if (property.targetType === 'mandate') {
      // Find mandate by matching criteria
      const mandate = mandates.find(m => {
        const seller = sellers.find(s => s.id === m.lead_id);
        return (
          m.city === property.city &&
          m.neighborhood === property.neighborhood &&
          (m.asking_price || seller?.price) === property.askingPrice
        );
      });
      
      if (mandate) {
        return { type: 'mandate', id: mandate.id };
      }
    } else {
      // Find seller by matching criteria
      const seller = sellers.find(s =>
        s.city === property.city &&
        s.neighborhood === property.neighborhood &&
        s.price === property.askingPrice
      );
      
      if (seller) {
        return { type: 'seller', id: seller.id };
      }
    }

    return null;
  }

  private mapFinanceStatus(
    status?: FinanceProfile['status']
  ): BuyerMatchCriteria['financeReadiness'] {
    switch (status) {
      case 'strong_buyer':
        return 'strong_buyer';
      case 'ready_to_progress':
        return 'ready_to_progress';
      case 'under_review':
      case 'needs_clarification':
        return 'under_review';
      case 'incomplete':
      default:
        return 'incomplete';
    }
  }

  private async insertMatches(
    matches: Array<Omit<MatchOpportunity, 'id' | 'created_at' | 'updated_at'>>,
    workspaceId: string
  ): Promise<number> {
    if (matches.length === 0) return 0;

    const rows = matches.map(m => ({
      buyer_id: m.buyer_id,
      target_type: m.target_type,
      target_id: m.target_id,
      match_score: m.match_score,
      score_value: m.score_value,
      match_reasons: m.match_reasons,
      blockers: m.blockers,
      status: m.status,
      priority: m.priority,
      recommended_action: m.recommended_action,
      notes: m.notes,
      workspace_id: workspaceId,
    }));

    // Insert in batches
    const batchSize = this.config.batchSize;
    let inserted = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      const { error } = await (this.supabase as any)
        .from('match_opportunities')
        .insert(batch);

      if (error) {
        console.error(`[MatchService] Error inserting batch ${i / batchSize + 1}:`, error);
        // Continue with next batch
      } else {
        inserted += batch.length;
      }
    }

    return inserted;
  }
}

// ============================================
// CONVENIENCE EXPORT
// ============================================

/**
 * Create a new MatchService instance with default config
 */
export function createMatchService(config?: Partial<MatchServiceConfig>, workspaceId?: string | null): MatchService {
  return new MatchService(config, undefined, workspaceId);
}

/**
 * Quick function to run match generation (for hooks/components)
 * Requires workspaceId for data isolation
 */
export async function runMatchGeneration(workspaceId?: string, config?: Partial<MatchServiceConfig>): Promise<MatchGenerationResult> {
  const service = createMatchService(config, workspaceId);
  return service.generateMatches(workspaceId);
}

/**
 * Generate matches for a specific buyer (for auto-matching on buyer creation)
 */
export async function generateMatchesForBuyer(buyerId: string, config?: Partial<MatchServiceConfig>): Promise<MatchGenerationResult> {
  const service = createMatchService(config);
  return service.generateMatchesForBuyer(buyerId);
}
