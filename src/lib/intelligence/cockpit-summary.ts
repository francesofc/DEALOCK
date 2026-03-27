/**
 * ============================================
 * DEALOCK COCKPIT SUMMARY GENERATOR
 * ============================================
 * 
 * Generates summary data for the cockpit StatusSummary components.
 * Transforms raw entity data into actionable business indicators.
 */

import { Lead, Mandate, MatchOpportunity, Activity } from "@/types/database";
import { Buyer, FinanceProfile } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";
import { getDaysSinceLastActivity, getStaleness } from "./next-actions";

// ============================================
// SELLER SUMMARY GENERATION
// ============================================

export interface SellerCockpitSummary {
  mandateStatus: 'none' | 'draft' | 'sent' | 'signed';
  mandateReadiness: number;
  daysSinceActivity: number;
  activityStatus: 'active' | 'recent' | 'stale' | 'critical';
  matchCount: number;
  hasExcellentMatches: boolean;
  relationshipState: 'cold' | 'warming' | 'engaged' | 'committed';
  nextMilestone: string;
  estimatedRevenue: number;
}

export function generateSellerCockpitSummary(
  lead: Lead,
  activities: Activity[],
  mandate: Mandate | null,
  matches: MatchOpportunity[],
  intelligence?: SellerIntelligence | null
): SellerCockpitSummary {
  const daysSinceActivity = getDaysSinceLastActivity(activities);
  const staleness = getStaleness(daysSinceActivity);
  
  // Map staleness to activity status
  const activityStatus = mapStalenessToStatus(daysSinceActivity);
  
  // Map relationship state from intelligence
  const relationshipState = mapRelationshipState(intelligence?.relationship_state);
  
  // Count matches for this seller
  const sellerMatches = matches.filter(m => 
    m.target_type === 'seller' && m.target_id === lead.id
  );
  
  // Calculate estimated commission (3% of price as example)
  const estimatedRevenue = lead.price ? lead.price * 0.03 : 0;
  
  return {
    mandateStatus: getMandateStatus(mandate),
    mandateReadiness: intelligence?.mandate_readiness_score || 0,
    daysSinceActivity,
    activityStatus,
    matchCount: sellerMatches.length,
    hasExcellentMatches: sellerMatches.some(m => m.match_score === 'excellent'),
    relationshipState,
    nextMilestone: determineNextMilestone(lead, mandate, intelligence?.mandate_readiness_score),
    estimatedRevenue
  };
}

function getMandateStatus(mandate: Mandate | null): 'none' | 'draft' | 'sent' | 'signed' {
  if (!mandate) return 'none';
  return mandate.status as 'draft' | 'sent' | 'signed';
}

function mapStalenessToStatus(days: number): 'active' | 'recent' | 'stale' | 'critical' {
  if (days <= 3) return 'active';
  if (days <= 7) return 'recent';
  if (days <= 14) return 'stale';
  return 'critical';
}

function mapRelationshipState(state?: string): 'cold' | 'warming' | 'engaged' | 'committed' {
  switch (state) {
    case 'committed': return 'committed';
    case 'warm': 
    case 'trusted': return 'engaged';
    case 'warming': return 'warming';
    case 'cold':
    default: return 'cold';
  }
}

function determineNextMilestone(
  lead: Lead, 
  mandate: Mandate | null,
  readinessScore?: number
): string {
  const status = lead.status;
  
  if (mandate?.status === 'signed') {
    return 'Find qualified buyers and schedule viewings';
  }
  
  if (mandate?.status === 'sent') {
    return 'Secure signature and activate mandate';
  }
  
  if (mandate?.status === 'draft') {
    return 'Send mandate for signature';
  }
  
  if (status === 'mandate_proposed') {
    return 'Convert proposal to signed mandate';
  }
  
  if (readinessScore && readinessScore > 70) {
    return 'Present and close mandate proposal';
  }
  
  if (status === 'replied' || status === 'call_scheduled') {
    return 'Build trust and propose mandate';
  }
  
  if (status === 'new' || status === 'contacted') {
    return 'Establish contact and qualify needs';
  }
  
  return 'Continue follow-up to build relationship';
}

// ============================================
// BUYER SUMMARY GENERATION
// ============================================

export interface BuyerCockpitSummary {
  financeStatus: 'incomplete' | 'under_review' | 'ready_to_progress' | 'strong_buyer';
  financeCompletion: number;
  matchCount: number;
  excellentMatches: number;
  timeline: 'browsing' | '3_months' | '1_month' | 'immediate';
  seriousness: 'low' | 'medium' | 'high' | 'very_high';
  daysSinceActivity: number;
  activityStatus: 'active' | 'recent' | 'stale' | 'critical';
  isPreApproved: boolean;
  maxBudget: number;
}

export function generateBuyerCockpitSummary(
  buyer: Buyer,
  activities: Activity[],
  finance: FinanceProfile | null,
  matches: MatchOpportunity[]
): BuyerCockpitSummary {
  const daysSinceActivity = getDaysSinceLastActivity(activities);
  const activityStatus = mapStalenessToStatus(daysSinceActivity);
  
  // Count excellent matches
  const excellentMatches = matches.filter(m => m.match_score === 'excellent').length;
  
  return {
    financeStatus: (finance?.status as any) || 'incomplete',
    financeCompletion: finance?.completion_percentage || 0,
    matchCount: matches.length,
    excellentMatches,
    timeline: buyer.timeline as any,
    seriousness: buyer.seriousness as any,
    daysSinceActivity,
    activityStatus,
    isPreApproved: buyer.pre_approved || false,
    maxBudget: buyer.budget_max
  };
}

// ============================================
// FORMATTING HELPERS
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}
