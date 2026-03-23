"use client";

import { Lead, LeadStatus, Buyer, BuyerStatus, FinanceProfile, FinanceStatus, MatchOpportunity, MatchStatus, MatchScore, Activity } from "@/types/database";

export type UrgencyLevel = 'critical' | 'high' | 'normal' | 'low';

export interface NextAction {
  action: string;
  reason: string;
  urgency: UrgencyLevel;
  suggested?: string;
}

// ============================================
// SELLER NEXT ACTIONS
// ============================================

export function getSellerNextAction(
  lead: Lead,
  activities: Activity[],
  mandate: { status: string } | null,
  readinessScore?: number
): NextAction {
  const daysSinceLastActivity = getDaysSinceLastActivity(activities);
  const status = lead.status;

  // Critical: Mandate sent but not signed
  if (mandate?.status === 'sent') {
    if (daysSinceLastActivity > 3) {
      return {
        action: "Follow up for signature",
        reason: `Mandate sent ${daysSinceLastActivity} days ago, signature pending`,
        urgency: "critical",
        suggested: "Call to confirm receipt and answer any questions"
      };
    }
    return {
      action: "Awaiting signature",
      reason: "Mandate sent recently, give client time to review",
      urgency: "normal"
    };
  }

  // Critical: Mandate proposed, high readiness
  if (status === 'mandate_proposed') {
    if (daysSinceLastActivity > 5) {
      return {
        action: "Follow up on mandate proposal",
        reason: "Proposal sent 5+ days ago, no response",
        urgency: "critical",
        suggested: "Call to discuss concerns and push for decision"
      };
    }
    return {
      action: "Push for mandate signature",
      reason: readinessScore && readinessScore > 70 
        ? `Readiness score ${readinessScore} - seller is ready`
        : "Mandate proposed, awaiting decision",
      urgency: "high"
    };
  }

  // High: Replied and engaged
  if (status === 'replied') {
    if (readinessScore && readinessScore > 70) {
      return {
        action: "Push for mandate signature",
        reason: `Readiness score ${readinessScore} - strike while hot`,
        urgency: "critical",
        suggested: "Propose mandate now, seller is engaged and ready"
      };
    }
    return {
      action: "Schedule call",
      reason: "Seller replied, maintain momentum",
      urgency: "high",
      suggested: "Schedule detailed qualification call"
    };
  }

  // High: Call scheduled
  if (status === 'call_scheduled') {
    return {
      action: "Prepare for meeting",
      reason: "Meeting scheduled - be ready to propose mandate",
      urgency: "high",
      suggested: "Prepare comparables and mandate documents"
    };
  }

  // High: Contacted but no reply
  if (status === 'contacted') {
    if (daysSinceLastActivity > 3) {
      return {
        action: "Send follow-up message",
        reason: `No reply after ${daysSinceLastActivity} days`,
        urgency: "high",
        suggested: "Send WhatsApp follow-up with property teaser"
      };
    }
    return {
      action: "Awaiting response",
      reason: "Initial contact sent recently",
      urgency: "normal"
    };
  }

  // High: New lead
  if (status === 'new') {
    return {
      action: "Call seller to introduce agency",
      reason: "New lead - establish contact within 24h",
      urgency: "high",
      suggested: "Call to understand motivation and timeline"
    };
  }

  // Normal: Stale records
  if (daysSinceLastActivity > 14) {
    return {
      action: "Re-engage after silence",
      reason: `No activity for ${daysSinceLastActivity} days`,
      urgency: "normal",
      suggested: "Send market update or new comparable sale"
    };
  }

  // Low: Signed mandate
  if (mandate?.status === 'signed') {
    return {
      action: "Nurture relationship",
      reason: "Mandate secured - maintain relationship",
      urgency: "low",
      suggested: "Send weekly activity reports and market updates"
    };
  }

  // Default
  return {
    action: "Continue follow-up",
    reason: `Status: ${status}`,
    urgency: "normal"
  };
}

// ============================================
// BUYER NEXT ACTIONS
// ============================================

export function getBuyerNextAction(
  buyer: Buyer,
  finance: FinanceProfile | null,
  activities: Activity[],
  matches: MatchOpportunity[]
): NextAction {
  const daysSinceLastActivity = getDaysSinceLastActivity(activities);
  const financeStatus = finance?.status;
  const hasMatches = matches.length > 0;
  const identifiedMatches = matches.filter(m => m.status === 'identified').length;

  // Critical: Finance incomplete blocks everything
  if (financeStatus === 'incomplete' || !finance) {
    const missingDocs = finance?.missing_documents?.length || 3;
    return {
      action: "Request missing finance documents",
      reason: `Finance incomplete - ${missingDocs} document(s) needed`,
      urgency: "critical",
      suggested: "Send document checklist via email/WhatsApp"
    };
  }

  // High: Finance under review
  if (financeStatus === 'under_review') {
    if (daysSinceLastActivity > 3) {
      return {
        action: "Follow up on submitted documents",
        reason: "Documents submitted, awaiting review",
        urgency: "high",
        suggested: "Call to confirm receipt and timeline"
      };
    }
    return {
      action: "Awaiting finance review",
      reason: "Documents recently submitted",
      urgency: "normal"
    };
  }

  // High: Needs clarification
  if (financeStatus === 'needs_clarification') {
    return {
      action: "Confirm income details",
      reason: "Finance team needs clarification",
      urgency: "high",
      suggested: "Call to clarify income sources or documents"
    };
  }

  // Critical: Immediate buyer ready to go
  if (buyer.timeline === 'immediate' && buyer.pre_approved && hasMatches) {
    return {
      action: "Schedule viewing immediately",
      reason: "Buyer ready, pre-approved, and matches available",
      urgency: "critical",
      suggested: "Call to schedule viewings this week"
    };
  }

  // High: Has identified matches
  if (identifiedMatches > 0) {
    return {
      action: "Contact buyer about opportunities",
      reason: `${identifiedMatches} matching propert${identifiedMatches === 1 ? 'y' : 'ies'} ready`,
      urgency: "high",
      suggested: "Send match summary and propose viewings"
    };
  }

  // High: High seriousness, no matches
  if (buyer.seriousness === 'high' || buyer.seriousness === 'very_high') {
    if (!hasMatches) {
      return {
        action: "Find matching opportunities",
        reason: "Serious buyer but no current matches",
        urgency: "high",
        suggested: "Check new listings and off-market opportunities"
      };
    }
  }

  // Normal: Stale buyer
  if (daysSinceLastActivity > 14) {
    return {
      action: "Re-engage inactive buyer",
      reason: `No activity for ${daysSinceLastActivity} days`,
      urgency: "normal",
      suggested: "Send new property alert or market update"
    };
  }

  // Low: Ready buyer
  if (financeStatus === 'ready_to_progress' || financeStatus === 'strong_buyer') {
    return {
      action: "Send matching opportunities",
      reason: "Buyer finance ready - time to match",
      urgency: hasMatches ? "high" : "normal",
      suggested: hasMatches ? "Present available matches" : "Expand search criteria"
    };
  }

  // Default
  return {
    action: "Continue qualification",
    reason: `Status: ${buyer.status}, Timeline: ${buyer.timeline}`,
    urgency: "normal"
  };
}

// ============================================
// MATCH FOLLOW-UP ACTIONS
// ============================================

export function getMatchNextAction(
  match: MatchOpportunity,
  buyerFinance: FinanceProfile | null
): NextAction {
  const score = match.match_score;
  const status = match.status;
  const hasBlockers = match.blockers && match.blockers.length > 0;

  // Critical: Excellent match not yet contacted
  if (score === 'excellent' && status === 'identified') {
    return {
      action: "Send opportunity now",
      reason: "Excellent match - high conversion probability",
      urgency: "critical",
      suggested: "Call immediately, this is a rare fit"
    };
  }

  // High: Good match, contacted but no response
  if (status === 'contacted_buyer') {
    const daysSinceContact = 5; // Would need actual activity timestamp
    if (daysSinceContact > 5) {
      return {
        action: "Relaunch buyer on match",
        reason: "No response after 5+ days",
        urgency: "high",
        suggested: "Send follow-up with additional property details"
      };
    }
    return {
      action: "Awaiting buyer response",
      reason: "Opportunity recently presented",
      urgency: "normal"
    };
  }

  // High: Has blockers
  if (hasBlockers) {
    return {
      action: "Resolve blockers first",
      reason: `Blockers: ${match.blockers?.join(', ')}`,
      urgency: "high",
      suggested: "Address concerns before pushing forward"
    };
  }

  // Normal: Good match but finance not ready
  if (score === 'good' && buyerFinance?.status !== 'ready_to_progress') {
    return {
      action: "Wait until finance ready",
      reason: `Buyer finance status: ${buyerFinance?.status || 'unknown'}`,
      urgency: "normal",
      suggested: "Prepare match details for when ready"
    };
  }

  // Normal: Viewing scheduled
  if (status === 'viewing_scheduled') {
    return {
      action: "Prepare for viewing",
      reason: "Viewing confirmed",
      urgency: "normal",
      suggested: "Send property details and directions"
    };
  }

  // Low: Weak match
  if (score === 'weak') {
    return {
      action: "Archive weak match",
      reason: "Low alignment - keep for other properties",
      urgency: "low"
    };
  }

  // Default
  return {
    action: "Monitor match progress",
    reason: `Score: ${score}, Status: ${status}`,
    urgency: "normal"
  };
}

// ============================================
// FINANCE FOLLOW-UP ACTIONS
// ============================================

export function getFinanceNextAction(
  finance: FinanceProfile | null,
  activities: Activity[]
): NextAction {
  if (!finance) {
    return {
      action: "Request finance documents",
      reason: "No finance profile created yet",
      urgency: "critical",
      suggested: "Send document checklist to buyer"
    };
  }

  const daysSinceLastActivity = getDaysSinceLastActivity(activities);
  const status = finance.status;
  const missingCount = finance.missing_documents?.length || 0;

  // Critical: Incomplete with missing docs
  if (status === 'incomplete') {
    if (missingCount > 0) {
      return {
        action: "Request missing documents",
        reason: `${missingCount} document(s) missing`,
        urgency: "critical",
        suggested: `Request: ${finance.missing_documents?.slice(0, 2).join(', ')}${missingCount > 2 ? '...' : ''}`
      };
    }
    return {
      action: "Complete finance profile",
      reason: "Profile started but incomplete",
      urgency: "high"
    };
  }

  // High: Under review, stale
  if (status === 'under_review') {
    if (daysSinceLastActivity > 3) {
      return {
        action: "Follow up on submitted docs",
        reason: `Review pending for ${daysSinceLastActivity} days`,
        urgency: "high",
        suggested: "Check with finance team and update buyer"
      };
    }
    return {
      action: "Awaiting review completion",
      reason: "Documents recently submitted",
      urgency: "normal"
    };
  }

  // High: Needs clarification
  if (status === 'needs_clarification') {
    return {
      action: "Confirm income details",
      reason: "Additional information needed",
      urgency: "high",
      suggested: "Call buyer to clarify specific items"
    };
  }

  // Normal: Ready
  if (status === 'ready_to_progress') {
    return {
      action: "Mark ready for matching",
      reason: "Finance approved - start matching",
      urgency: "normal",
      suggested: "Activate buyer in match engine"
    };
  }

  // Low: Strong buyer
  if (status === 'strong_buyer') {
    return {
      action: "Prioritize for best properties",
      reason: "Strong buyer - fast close possible",
      urgency: "low"
    };
  }

  return {
    action: "Monitor finance status",
    reason: `Status: ${status}`,
    urgency: "normal"
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getDaysSinceLastActivity(activities: Activity[]): number {
  if (!activities || activities.length === 0) {
    return 999; // No activity = very stale
  }
  
  // Sort by created_at desc and get most recent
  const sorted = [...activities].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  const lastActivity = new Date(sorted[0].created_at);
  const now = new Date();
  const diffMs = now.getTime() - lastActivity.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getStaleness(daysSinceActivity: number): { label: string; color: string } {
  if (daysSinceActivity > 14) {
    return { label: "Stale", color: "text-red-400" };
  }
  if (daysSinceActivity > 7) {
    return { label: "Needs attention", color: "text-amber-400" };
  }
  if (daysSinceActivity > 3) {
    return { label: "Recent", color: "text-white/60" };
  }
  return { label: "Active", color: "text-emerald-400" };
}

export function urgencyColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'critical':
      return 'bg-red-500/15 text-red-400 border-red-500/20';
    case 'high':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    case 'normal':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
    case 'low':
      return 'bg-white/10 text-white/60 border-white/10';
  }
}

export function urgencyBadge(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-amber-500 text-black';
    case 'normal':
      return 'bg-blue-500 text-white';
    case 'low':
      return 'bg-white/20 text-white';
  }
}
