/**
 * ============================================
 * DEALOCK AUTOMATIC MATCHING ENGINE
 * ============================================
 * 
 * Core matching logic for Dealock's Match Intelligence layer.
 * Generates match opportunities automatically based on buyer criteria
 * and available properties (mandates and sellers).
 * 
 * This is ARCHITECTURE PREP — the full engine will be implemented
 * in a future phase. Current structure defines the interfaces
 * and scoring framework.
 */

import { Buyer, Mandate, Lead, MatchOpportunity, MatchScore, TargetType } from '@/types/database';

// ============================================
// MATCH CRITERIA INTERFACES
// ============================================

/**
 * Buyer-side matching criteria
 * What the buyer is looking for
 */
export interface BuyerMatchCriteria {
  // Budget
  budgetMin: number;
  budgetMax: number;
  
  // Location preferences
  targetAreas: string[]; // City/neighborhood names
  
  // Property requirements
  propertyTypes: string[]; // e.g., ['apartment', 'house', 'loft']
  minAreaM2: number | null;
  minBedrooms: number | null;
  
  // Timeline and readiness
  timeline: 'browsing' | '3_months' | '1_month' | 'immediate';
  seriousness: 'low' | 'medium' | 'high' | 'very_high';
  
  // Finance signals
  preApproved: boolean;
  cashBuyer: boolean;
  financeReadiness: 'incomplete' | 'under_review' | 'ready_to_progress' | 'strong_buyer';
}

/**
 * Property-side matching criteria
 * What the mandate or seller offers
 */
export interface PropertyMatchCriteria {
  // Pricing
  askingPrice: number;
  
  // Location
  city: string;
  neighborhood: string;
  
  // Property details
  propertyType: string;
  areaM2: number | null;
  bedrooms: number | null;
  
  // Mandate/seller status
  targetType: TargetType;
  mandateStatus?: 'draft' | 'sent' | 'signed' | 'expired' | 'terminated';
  exclusive?: boolean;
  
  // Availability signals
  daysOnMarket: number | null;
  sellerMotivation: 'low' | 'medium' | 'high' | 'very_high' | null;
}

// ============================================
// MATCH SCORING INTERFACES
// ============================================

/**
 * Individual factor score
 */
export interface MatchFactorScore {
  name: string;
  weight: number; // 0-1
  score: number; // 0-100
  status: 'aligned' | 'partial' | 'gap';
  detail: string;
}

/**
 * Blocker identification
 */
export interface MatchBlocker {
  type: 'price' | 'location' | 'type' | 'size' | 'timing' | 'finance' | 'availability';
  severity: 'blocking' | 'negotiable' | 'minor';
  description: string;
  suggestion: string;
}

/**
 * Recommended next action
 */
export interface MatchAction {
  action: string;
  reason: string;
  urgency: 'critical' | 'high' | 'normal' | 'low';
  suggestedTimeline: string;
}

/**
 * Complete match analysis result
 */
export interface MatchAnalysisResult {
  score: number; // 0-100
  matchScoreBand: MatchScore;
  factors: MatchFactorScore[];
  blockers: MatchBlocker[];
  recommendedAction: MatchAction;
  matchReasons: string[];
}

// ============================================
// ENGINE CONFIGURATION
// ============================================

/**
 * Scoring weights for different match factors
 * Can be adjusted based on market conditions
 */
export interface MatchWeights {
  budget: number; // Price alignment
  location: number; // Area match
  propertyType: number; // Type alignment
  size: number; // Area/bedrooms match
  timeline: number; // Urgency alignment
  readiness: number; // Finance readiness
  mandateStrength: number; // Mandate vs seller preference
}

/**
 * Default scoring weights
 */
export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  budget: 0.30,
  location: 0.25,
  propertyType: 0.15,
  size: 0.10,
  timeline: 0.10,
  readiness: 0.05,
  mandateStrength: 0.05,
};

/**
 * Thresholds for match score bands
 */
export interface MatchThresholds {
  excellent: number; // >= this score
  good: number; // >= this score
  fair: number; // >= this score
  // weak is < fair
}

export const DEFAULT_MATCH_THRESHOLDS: MatchThresholds = {
  excellent: 85,
  good: 70,
  fair: 50,
};

// ============================================
// MATCH ENGINE CLASS
// ============================================

export class MatchEngine {
  private weights: MatchWeights;
  private thresholds: MatchThresholds;

  constructor(
    weights: MatchWeights = DEFAULT_MATCH_WEIGHTS,
    thresholds: MatchThresholds = DEFAULT_MATCH_THRESHOLDS
  ) {
    this.weights = weights;
    this.thresholds = thresholds;
  }

  /**
   * Analyze a single buyer-property pair
   * Returns complete match analysis
   */
  analyzeMatch(
    buyer: BuyerMatchCriteria,
    property: PropertyMatchCriteria
  ): MatchAnalysisResult {
    const factors: MatchFactorScore[] = [];
    const blockers: MatchBlocker[] = [];
    const matchReasons: string[] = [];

    // 1. Budget Analysis
    const budgetAnalysis = this.analyzeBudget(buyer, property);
    factors.push(budgetAnalysis.factor);
    if (budgetAnalysis.blocker) blockers.push(budgetAnalysis.blocker);
    if (budgetAnalysis.reason) matchReasons.push(budgetAnalysis.reason);

    // 2. Location Analysis
    const locationAnalysis = this.analyzeLocation(buyer, property);
    factors.push(locationAnalysis.factor);
    if (locationAnalysis.blocker) blockers.push(locationAnalysis.blocker);
    if (locationAnalysis.reason) matchReasons.push(locationAnalysis.reason);

    // 3. Property Type Analysis
    const typeAnalysis = this.analyzePropertyType(buyer, property);
    factors.push(typeAnalysis.factor);
    if (typeAnalysis.blocker) blockers.push(typeAnalysis.blocker);
    if (typeAnalysis.reason) matchReasons.push(typeAnalysis.reason);

    // 4. Size Analysis
    const sizeAnalysis = this.analyzeSize(buyer, property);
    factors.push(sizeAnalysis.factor);
    if (sizeAnalysis.blocker) blockers.push(sizeAnalysis.blocker);
    if (sizeAnalysis.reason) matchReasons.push(sizeAnalysis.reason);

    // 5. Timeline Analysis
    const timelineAnalysis = this.analyzeTimeline(buyer, property);
    factors.push(timelineAnalysis.factor);
    if (timelineAnalysis.blocker) blockers.push(timelineAnalysis.blocker);
    if (timelineAnalysis.reason) matchReasons.push(timelineAnalysis.reason);

    // 6. Readiness Analysis
    const readinessAnalysis = this.analyzeReadiness(buyer, property);
    factors.push(readinessAnalysis.factor);
    if (readinessAnalysis.blocker) blockers.push(readinessAnalysis.blocker);
    if (readinessAnalysis.reason) matchReasons.push(readinessAnalysis.reason);

    // 7. Mandate Strength (bonus)
    const mandateAnalysis = this.analyzeMandateStrength(property);
    factors.push(mandateAnalysis.factor);
    if (mandateAnalysis.reason) matchReasons.push(mandateAnalysis.reason);

    // Calculate total score
    const totalScore = Math.round(
      factors.reduce((sum, f) => sum + f.score * f.weight, 0)
    );

    // Determine score band
    const matchScoreBand = this.getScoreBand(totalScore);

    // Generate recommended action
    const recommendedAction = this.generateRecommendedAction(
      totalScore,
      blockers,
      buyer,
      property
    );

    return {
      score: totalScore,
      matchScoreBand,
      factors,
      blockers,
      recommendedAction,
      matchReasons,
    };
  }

  /**
   * Generate matches for a single buyer against all properties
   */
  generateMatchesForBuyer(
    buyer: BuyerMatchCriteria,
    properties: PropertyMatchCriteria[]
  ): Array<{ property: PropertyMatchCriteria; analysis: MatchAnalysisResult }> {
    return properties
      .map(property => ({
        property,
        analysis: this.analyzeMatch(buyer, property),
      }))
      .filter(result => result.analysis.score >= this.thresholds.fair)
      .sort((a, b) => b.analysis.score - a.analysis.score);
  }

  /**
   * Generate all possible matches (cartesian product)
   * Use with caution - can be expensive for large datasets
   */
  generateAllMatches(
    buyers: BuyerMatchCriteria[],
    properties: PropertyMatchCriteria[]
  ): Array<{
    buyer: BuyerMatchCriteria;
    property: PropertyMatchCriteria;
    analysis: MatchAnalysisResult;
  }> {
    const matches = [];
    for (const buyer of buyers) {
      for (const property of properties) {
        const analysis = this.analyzeMatch(buyer, property);
        if (analysis.score >= this.thresholds.fair) {
          matches.push({ buyer, property, analysis });
        }
      }
    }
    return matches.sort((a, b) => b.analysis.score - a.analysis.score);
  }

  // ============================================
  // PRIVATE ANALYSIS METHODS
  // ============================================

  private analyzeBudget(
    buyer: BuyerMatchCriteria,
    property: PropertyMatchCriteria
  ): { factor: MatchFactorScore; blocker?: MatchBlocker; reason?: string } {
    const priceRatio = property.askingPrice / buyer.budgetMax;
    let score: number;
    let status: 'aligned' | 'partial' | 'gap';
    let detail: string;
    let blocker: MatchBlocker | undefined;
    let reason: string | undefined;

    if (priceRatio <= 0.9) {
      score = 100;
      status = 'aligned';
      detail = 'Well within budget';
      reason = `Price €${(property.askingPrice / 1000).toFixed(0)}k below €${(buyer.budgetMax / 1000).toFixed(0)}k max`;
    } else if (priceRatio <= 1.0) {
      score = 90;
      status = 'aligned';
      detail = 'Within budget';
      reason = `Price within €${(buyer.budgetMax / 1000).toFixed(0)}k budget`;
    } else if (priceRatio <= 1.1) {
      score = 70;
      status = 'partial';
      detail = '10% over budget';
      reason = 'Slightly over budget but negotiable';
    } else if (priceRatio <= 1.2) {
      score = 50;
      status = 'partial';
      detail = '20% over budget';
      blocker = {
        type: 'price',
        severity: 'negotiable',
        description: `Price is ${((priceRatio - 1) * 100).toFixed(0)}% above buyer's max budget`,
        suggestion: 'Discuss price flexibility or financing options',
      };
    } else {
      score = 20;
      status = 'gap';
      detail = 'Significantly over budget';
      blocker = {
        type: 'price',
        severity: 'blocking',
        description: `Price is ${((priceRatio - 1) * 100).toFixed(0)}% above budget`,
        suggestion: 'Not viable unless buyer increases budget significantly',
      };
    }

    return {
      factor: {
        name: 'Budget',
        weight: this.weights.budget,
        score,
        status,
        detail,
      },
      blocker,
      reason,
    };
  }

  private analyzeLocation(
    buyer: BuyerMatchCriteria,
    property: PropertyMatchCriteria
  ): { factor: MatchFactorScore; blocker?: MatchBlocker; reason?: string } {
    const areaMatch = buyer.targetAreas.some(area =>
      property.neighborhood.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(property.neighborhood.toLowerCase()) ||
      property.city.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(property.city.toLowerCase())
    );

    const cityMatch = buyer.targetAreas.some(area =>
      property.city.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(property.city.toLowerCase())
    );

    let score: number;
    let status: 'aligned' | 'partial' | 'gap';
    let detail: string;
    let reason: string | undefined;

    if (areaMatch) {
      score = 100;
      status = 'aligned';
      detail = 'Target neighborhood match';
      reason = `${property.neighborhood} matches target areas`;
    } else if (cityMatch) {
      score = 75;
      status = 'partial';
      detail = 'Same city, different neighborhood';
      reason = `Located in ${property.city}`;
    } else {
      score = 40;
      status = 'gap';
      detail = 'Outside target areas';
    }

    return {
      factor: {
        name: 'Location',
        weight: this.weights.location,
        score,
        status,
        detail,
      },
      reason,
    };
  }

  private analyzePropertyType(
    buyer: BuyerMatchCriteria,
    property: PropertyMatchCriteria
  ): { factor: MatchFactorScore; blocker?: MatchBlocker; reason?: string } {
    const typeMatch = buyer.propertyTypes.some(type =>
      property.propertyType.toLowerCase().includes(type.toLowerCase()) ||
      type.toLowerCase().includes(property.propertyType.toLowerCase())
    );

    let score: number;
    let status: 'aligned' | 'partial' | 'gap';
    let detail: string;
    let reason: string | undefined;

    if (typeMatch) {
      score = 100;
      status = 'aligned';
      detail = 'Preferred property type';
      reason = `${property.propertyType} matches buyer preference`;
    } else {
      score = 50;
      status = 'partial';
      detail = 'Alternative property type';
    }

    return {
      factor: {
        name: 'Property Type',
        weight: this.weights.propertyType,
        score,
        status,
        detail,
      },
      reason,
    };
  }

  private analyzeSize(
    buyer: BuyerMatchCriteria,
    property: PropertyMatchCriteria
  ): { factor: MatchFactorScore; blocker?: MatchBlocker; reason?: string } {
    let score = 100;
    let status: 'aligned' | 'partial' | 'gap' = 'aligned';
    let detail = 'Meets size requirements';
    let blocker: MatchBlocker | undefined;
    let reason: string | undefined;

    // Bedroom check
    if (buyer.minBedrooms && property.bedrooms) {
      if (property.bedrooms < buyer.minBedrooms) {
        const deficit = buyer.minBedrooms - property.bedrooms;
        score = Math.max(30, score - deficit * 30);
        status = 'gap';
        detail = `${property.bedrooms} beds vs ${buyer.minBedrooms} min required`;
        blocker = {
          type: 'size',
          severity: deficit > 1 ? 'blocking' : 'negotiable',
          description: `Property has ${deficit} fewer bedroom${deficit > 1 ? 's' : ''} than required`,
          suggestion: 'Check if buyer can compromise on bedroom count',
        };
      } else {
        reason = `${property.bedrooms} bedrooms meets ${buyer.minBedrooms} requirement`;
      }
    }

    // Area check
    if (buyer.minAreaM2 && property.areaM2) {
      if (property.areaM2 < buyer.minAreaM2) {
        const ratio = property.areaM2 / buyer.minAreaM2;
        score = Math.min(score, Math.round(ratio * 100));
        if (ratio < 0.8) {
          status = 'gap';
          detail = `${property.areaM2}m² vs ${buyer.minAreaM2}m² min`;
        } else {
          status = 'partial';
          detail = 'Slightly under size preference';
        }
      } else if (!reason) {
        reason = `${property.areaM2}m² meets ${buyer.minAreaM2}m² requirement`;
      }
    }

    return {
      factor: {
        name: 'Size',
        weight: this.weights.size,
        score,
        status,
        detail,
      },
      blocker,
      reason,
    };
  }

  private analyzeTimeline(
    buyer: BuyerMatchCriteria,
    property: PropertyMatchCriteria
  ): { factor: MatchFactorScore; blocker?: MatchBlocker; reason?: string } {
    const timelineScores: Record<string, number> = {
      immediate: 100,
      '1_month': 80,
      '3_months': 60,
      browsing: 40,
    };

    const score = timelineScores[buyer.timeline] || 50;
    const status: 'aligned' | 'partial' | 'gap' = 
      buyer.timeline === 'immediate' ? 'aligned' :
      buyer.timeline === '1_month' ? 'partial' : 'gap';

    const detailMap: Record<string, string> = {
      immediate: 'Ready to move immediately',
      '1_month': 'Can close within 1 month',
      '3_months': '3 month timeline',
      browsing: 'Just browsing',
    };

    return {
      factor: {
        name: 'Timeline',
        weight: this.weights.timeline,
        score,
        status,
        detail: detailMap[buyer.timeline] || buyer.timeline,
      },
    };
  }

  private analyzeReadiness(
    buyer: BuyerMatchCriteria,
    property: PropertyMatchCriteria
  ): { factor: MatchFactorScore; blocker?: MatchBlocker; reason?: string } {
    const readinessScores: Record<string, number> = {
      strong_buyer: 100,
      ready_to_progress: 85,
      under_review: 60,
      incomplete: 30,
    };

    const score = readinessScores[buyer.financeReadiness] || 50;
    const status: 'aligned' | 'partial' | 'gap' =
      buyer.financeReadiness === 'strong_buyer' || buyer.financeReadiness === 'ready_to_progress'
        ? 'aligned'
        : buyer.financeReadiness === 'under_review'
        ? 'partial'
        : 'gap';

    let blocker: MatchBlocker | undefined;
    if (buyer.financeReadiness === 'incomplete') {
      blocker = {
        type: 'finance',
        severity: 'blocking',
        description: 'Buyer has not completed financial documentation',
        suggestion: 'Request finance profile completion before proceeding',
      };
    }

    const detailMap: Record<string, string> = {
      strong_buyer: 'Pre-approved / Cash buyer',
      ready_to_progress: 'Finance ready',
      under_review: 'Documents under review',
      incomplete: 'Finance documentation incomplete',
    };

    return {
      factor: {
        name: 'Readiness',
        weight: this.weights.readiness,
        score,
        status,
        detail: detailMap[buyer.financeReadiness] || buyer.financeReadiness,
      },
      blocker,
    };
  }

  private analyzeMandateStrength(
    property: PropertyMatchCriteria
  ): { factor: MatchFactorScore; reason?: string } {
    // Prefer mandates over sellers (more committed sellers)
    let score = 70;
    let reason: string | undefined;

    if (property.targetType === 'mandate') {
      score = property.exclusive ? 100 : 90;
      reason = property.exclusive 
        ? 'Exclusive mandate — committed seller' 
        : 'Mandate in place — signed seller';
    }

    return {
      factor: {
        name: 'Mandate Strength',
        weight: this.weights.mandateStrength,
        score,
        status: score >= 90 ? 'aligned' : 'partial',
        detail: property.targetType === 'mandate' 
          ? (property.exclusive ? 'Exclusive mandate' : 'Non-exclusive mandate')
          : 'Pre-mandate seller',
      },
      reason,
    };
  }

  private getScoreBand(score: number): MatchScore {
    if (score >= this.thresholds.excellent) return 'excellent';
    if (score >= this.thresholds.good) return 'good';
    if (score >= this.thresholds.fair) return 'fair';
    return 'weak';
  }

  private generateRecommendedAction(
    score: number,
    blockers: MatchBlocker[],
    buyer: BuyerMatchCriteria,
    property: PropertyMatchCriteria
  ): MatchAction {
    const hasBlockingIssues = blockers.some(b => b.severity === 'blocking');
    const hasNegotiableIssues = blockers.some(b => b.severity === 'negotiable');

    // Critical: Blocking issues
    if (hasBlockingIssues) {
      const mainBlocker = blockers.find(b => b.severity === 'blocking');
      return {
        action: 'Resolve blockers before proceeding',
        reason: mainBlocker?.description || 'Critical issues prevent match',
        urgency: 'critical',
        suggestedTimeline: 'Address blockers first',
      };
    }

    // High: Excellent match, no blockers
    if (score >= this.thresholds.excellent && !hasNegotiableIssues) {
      return {
        action: 'Contact buyer immediately',
        reason: 'Excellent fit — high conversion probability',
        urgency: 'high',
        suggestedTimeline: 'Within 24 hours',
      };
    }

    // High: Good match with minor issues
    if (score >= this.thresholds.good) {
      return {
        action: hasNegotiableIssues ? 'Present with caveats' : 'Contact buyer',
        reason: hasNegotiableIssues 
          ? 'Strong match with negotiation points'
          : 'Good alignment on key criteria',
        urgency: 'high',
        suggestedTimeline: 'Within 48 hours',
      };
    }

    // Normal: Fair match
    if (score >= this.thresholds.fair) {
      return {
        action: 'Add to watchlist',
        reason: 'Some alignment but gaps exist',
        urgency: 'normal',
        suggestedTimeline: 'Follow up within 1 week',
      };
    }

    // Low: Weak match
    return {
      action: 'Keep in pipeline',
      reason: 'Limited alignment — monitor for better matches',
      urgency: 'low',
      suggestedTimeline: 'Review monthly',
    };
  }
}

// ============================================
// CONVERSION HELPERS
// ============================================

/**
 * Convert Buyer database record to match criteria
 */
export function buyerToMatchCriteria(
  buyer: Buyer,
  financeReadiness: 'incomplete' | 'under_review' | 'ready_to_progress' | 'strong_buyer' = 'incomplete'
): BuyerMatchCriteria {
  return {
    budgetMin: buyer.budget_min,
    budgetMax: buyer.budget_max,
    targetAreas: buyer.target_areas,
    propertyTypes: buyer.property_types,
    minAreaM2: buyer.min_area_m2,
    minBedrooms: buyer.min_bedrooms,
    timeline: buyer.timeline,
    seriousness: buyer.seriousness,
    preApproved: buyer.pre_approved,
    cashBuyer: buyer.cash_buyer,
    financeReadiness,
  };
}

/**
 * Convert Mandate database record to property match criteria
 */
export function mandateToPropertyCriteria(
  mandate: Mandate,
  seller?: Lead
): PropertyMatchCriteria {
  return {
    askingPrice: mandate.asking_price || seller?.price || 0,
    city: mandate.city || seller?.city || '',
    neighborhood: mandate.neighborhood || seller?.neighborhood || '',
    propertyType: mandate.property_type || seller?.property_type || '',
    areaM2: mandate.area_m2 ?? seller?.area_m2 ?? null,
    bedrooms: mandate.bedrooms ?? seller?.bedrooms ?? null,
    targetType: 'mandate',
    mandateStatus: mandate.status,
    exclusive: mandate.exclusive,
    daysOnMarket: null, // Would need to calculate from listing date
    sellerMotivation: null, // Would need to derive from seller data
  };
}

/**
 * Convert Lead (seller) database record to property match criteria
 */
export function sellerToPropertyCriteria(seller: Lead): PropertyMatchCriteria {
  return {
    askingPrice: seller.price,
    city: seller.city,
    neighborhood: seller.neighborhood,
    propertyType: seller.property_type,
    areaM2: seller.area_m2,
    bedrooms: seller.bedrooms,
    targetType: 'seller',
    daysOnMarket: seller.days_on_market_estimate,
    sellerMotivation: null, // Would need qualification data
  };
}

/**
 * Convert match analysis to database MatchOpportunity
 */
export function analysisToMatchOpportunity(
  buyerId: string,
  targetType: TargetType,
  targetId: string,
  analysis: MatchAnalysisResult
): Omit<MatchOpportunity, 'id' | 'created_at' | 'updated_at'> {
  return {
    buyer_id: buyerId,
    target_type: targetType,
    target_id: targetId,
    match_score: analysis.matchScoreBand,
    score_value: analysis.score,
    match_reasons: analysis.matchReasons,
    blockers: analysis.blockers.map(b => b.description),
    status: 'identified',
    priority: analysis.recommendedAction.urgency === 'critical' ? 'urgent' :
              analysis.recommendedAction.urgency === 'high' ? 'high' :
              analysis.recommendedAction.urgency === 'normal' ? 'medium' : 'low',
    recommended_action: analysis.recommendedAction.action,
    notes: null,
  };
}

// ============================================
// SERVICE LAYER (Future Implementation)
// ============================================

/**
 * MatchService interface for persistence layer
 * This will be implemented to save generated matches to Supabase
 */
export interface MatchService {
  /**
   * Generate and persist matches for a buyer
   */
  generateAndSaveMatches(buyerId: string): Promise<MatchOpportunity[]>;
  
  /**
   * Generate and persist matches for a property
   */
  generateAndSavePropertyMatches(propertyId: string, targetType: TargetType): Promise<MatchOpportunity[]>;
  
  /**
   * Run full matching engine across all buyers and properties
   */
  runFullMatchingEngine(): Promise<{
    created: number;
    updated: number;
    archived: number;
  }>;
  
  /**
   * Refresh matches for a specific buyer (re-run engine)
   */
  refreshBuyerMatches(buyerId: string): Promise<MatchOpportunity[]>;
}

/**
 * Placeholder for future MatchService implementation
 * 
 * Usage (future):
 * const matchService = createMatchService(supabaseClient);
 * const newMatches = await matchService.generateAndSaveMatches(buyerId);
 */
export function createMatchService(
  // supabase: SupabaseClient
): MatchService {
  // This is a stub for the future implementation
  // It will:
  // 1. Fetch all buyers with their criteria
  // 2. Fetch all mandates and sellers
  // 3. Run MatchEngine across all combinations
  // 4. Persist non-existing matches to match_opportunities table
  // 5. Update existing matches if scores changed significantly
  // 6. Archive stale matches
  
  throw new Error('MatchService not yet implemented — this is architecture prep only');
}
