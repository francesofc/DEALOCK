"use client";

import { AlertTriangle, TrendingUp, Clock, Zap, Target, AlertCircle } from "lucide-react";
import { Lead, LeadStatus } from "@/types/database";
import { Buyer, BuyerStatus, FinanceProfile, MatchOpportunity } from "@/types/database";
import { getDaysSinceLastActivity, getStaleness } from "@/lib/intelligence/next-actions";
import { Activity } from "@/types/database";

// ============================================
// SELLER WHY THIS MATTERS
// ============================================

interface SellerWhyThisMattersProps {
  lead: Lead;
  activities: Activity[];
  mandate: { status: string } | null;
  readinessScore?: number;
  matchCount: number;
}

export function SellerWhyThisMatters({ 
  lead, 
  activities, 
  mandate, 
  readinessScore,
  matchCount 
}: SellerWhyThisMattersProps) {
  const analysis = analyzeSellerUrgency(lead, activities, mandate, readinessScore, matchCount);
  
  if (!analysis.show || !analysis.styles) return null;

  const Icon = analysis.icon!;

  return (
    <div className={`p-5 rounded-xl border ${analysis.styles.container}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${analysis.styles.iconBg}`}>
          <Icon className={`w-5 h-5 ${analysis.styles.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium mb-1 ${analysis.styles.title}`}>
            {analysis.headline}
          </h3>
          <p className="text-sm text-white/60 mb-3">
            {analysis.explanation}
          </p>
          {analysis.action && (
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-lg ${analysis.styles.badge}`}>
                {analysis.urgencyLabel}
              </span>
              <span className="text-xs text-white/40">
                {analysis.action}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function analyzeSellerUrgency(
  lead: Lead,
  activities: Activity[],
  mandate: { status: string } | null,
  readinessScore?: number,
  matchCount?: number
): UrgencyAnalysis {
  const daysSinceActivity = getDaysSinceLastActivity(activities);
  const status = lead.status;
  
  // Critical: Mandate sent, no signature
  if (mandate?.status === 'sent') {
    if (daysSinceActivity > 3) {
      return {
        show: true,
        headline: "Signature pending — follow up now",
        explanation: `Mandate sent ${daysSinceActivity} days ago but not signed. Every day without signature increases risk of losing exclusivity to a competitor.`,
        action: "Call today to confirm receipt and address concerns",
        urgencyLabel: "Critical",
        icon: AlertTriangle,
        styles: {
          container: "bg-red-500/[0.05] border-red-500/20",
          iconBg: "bg-red-500/10",
          icon: "text-red-400",
          title: "text-red-400",
          badge: "bg-red-500 text-white"
        }
      };
    }
    return {
      show: true,
      headline: "Mandate in signature phase",
      explanation: "Mandate sent recently. This is the critical conversion moment — be available for questions and ready to close.",
      action: "Stay responsive, prepare for pushback",
      urgencyLabel: "High",
      icon: Target,
      styles: {
        container: "bg-amber-500/[0.05] border-amber-500/20",
        iconBg: "bg-amber-500/10",
        icon: "text-amber-400",
        title: "text-amber-400",
        badge: "bg-amber-500 text-black"
      }
    };
  }
  
  // Critical: High readiness but no mandate
  if (!mandate && readinessScore && readinessScore > 70 && status === 'replied') {
    return {
      show: true,
      headline: "Ready to commit — strike now",
      explanation: `Readiness score of ${readinessScore}% indicates seller is prepared to sign. Waiting risks cooling their enthusiasm or competitor intervention.`,
      action: "Propose mandate this week",
      urgencyLabel: "High",
      icon: Zap,
      styles: {
        container: "bg-violet-500/[0.05] border-violet-500/20",
        iconBg: "bg-violet-500/10",
        icon: "text-violet-400",
        title: "text-violet-400",
        badge: "bg-violet-500 text-white"
      }
    };
  }
  
  // High: New lead
  if (status === 'new') {
    return {
      show: true,
      headline: "Fresh lead — first contact window",
      explanation: "Response rates drop 50% after 24 hours. This lead just entered the system — immediate contact maximizes conversion probability.",
      action: "Call within 2 hours",
      urgencyLabel: "High",
      icon: TrendingUp,
      styles: {
        container: "bg-emerald-500/[0.05] border-emerald-500/20",
        iconBg: "bg-emerald-500/10",
        icon: "text-emerald-400",
        title: "text-emerald-400",
        badge: "bg-emerald-500 text-white"
      }
    };
  }
  
  // Warning: Stale record
  if (daysSinceActivity > 14) {
    return {
      show: true,
      headline: "Stale record — re-engagement needed",
      explanation: `${daysSinceActivity} days without contact. This seller may be exploring other agencies or losing motivation. Re-activation is harder than keeping momentum.`,
      action: "Send market update or comparable sale",
      urgencyLabel: "Warning",
      icon: Clock,
      styles: {
        container: "bg-white/[0.03] border-white/[0.08]",
        iconBg: "bg-white/[0.06]",
        icon: "text-white/60",
        title: "text-white/80",
        badge: "bg-white/20 text-white"
      }
    };
  }
  
  // Normal: Mandate signed with matches
  if (mandate?.status === 'signed' && matchCount && matchCount > 0) {
    return {
      show: true,
      headline: "Active mandate with buyer interest",
      explanation: `Exclusivity secured with ${matchCount} potential buyer match${matchCount > 1 ? 'es' : ''}. Focus shifts to activation and viewings.`,
      action: "Qualify matches and schedule viewings",
      urgencyLabel: "Active",
      icon: Target,
      styles: {
        container: "bg-emerald-500/[0.05] border-emerald-500/20",
        iconBg: "bg-emerald-500/10",
        icon: "text-emerald-400",
        title: "text-emerald-400",
        badge: "bg-emerald-500/20 text-emerald-400"
      }
    };
  }
  
  return { show: false };
}

// ============================================
// BUYER WHY THIS MATTERS
// ============================================

interface BuyerWhyThisMattersProps {
  buyer: Buyer;
  activities: Activity[];
  finance: FinanceProfile | null;
  matches: MatchOpportunity[];
}

export function BuyerWhyThisMatters({ 
  buyer, 
  activities, 
  finance, 
  matches 
}: BuyerWhyThisMattersProps) {
  const analysis = analyzeBuyerUrgency(buyer, activities, finance, matches);
  
  if (!analysis.show || !analysis.styles) return null;

  const Icon = analysis.icon!;

  return (
    <div className={`p-5 rounded-xl border ${analysis.styles.container}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${analysis.styles.iconBg}`}>
          <Icon className={`w-5 h-5 ${analysis.styles.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium mb-1 ${analysis.styles.title}`}>
            {analysis.headline}
          </h3>
          <p className="text-sm text-white/60 mb-3">
            {analysis.explanation}
          </p>
          {analysis.action && (
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-lg ${analysis.styles.badge}`}>
                {analysis.urgencyLabel}
              </span>
              <span className="text-xs text-white/40">
                {analysis.action}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function analyzeBuyerUrgency(
  buyer: Buyer,
  activities: Activity[],
  finance: FinanceProfile | null,
  matches: MatchOpportunity[]
): UrgencyAnalysis {
  const daysSinceActivity = getDaysSinceLastActivity(activities);
  const financeStatus = finance?.status;
  const excellentMatches = matches.filter(m => m.match_score === 'excellent').length;
  
  // Critical: Excellent matches but finance incomplete
  if (excellentMatches > 0 && financeStatus === 'incomplete') {
    return {
      show: true,
      headline: "Perfect matches waiting — finance blocks progress",
      explanation: `${excellentMatches} excellent propert${excellentMatches > 1 ? 'ies' : 'y'} identified but buyer cannot proceed without complete finance documentation. Risk of losing properties to ready buyers.`,
      action: "Request missing documents immediately",
      urgencyLabel: "Critical",
      icon: AlertTriangle,
      styles: {
        container: "bg-red-500/[0.05] border-red-500/20",
        iconBg: "bg-red-500/10",
        icon: "text-red-400",
        title: "text-red-400",
        badge: "bg-red-500 text-white"
      }
    };
  }
  
  // Critical: Immediate timeline, ready to go
  if (buyer.timeline === 'immediate' && buyer.pre_approved && excellentMatches > 0) {
    return {
      show: true,
      headline: "Hot buyer ready — act immediately",
      explanation: `Pre-approved buyer with immediate timeline and ${excellentMatches} excellent match${excellentMatches > 1 ? 'es' : ''}. This is maximum priority — speed of execution determines closing success.`,
      action: "Schedule viewings this week, prepare offers",
      urgencyLabel: "Critical",
      icon: Zap,
      styles: {
        container: "bg-violet-500/[0.05] border-violet-500/20",
        iconBg: "bg-violet-500/10",
        icon: "text-violet-400",
        title: "text-violet-400",
        badge: "bg-violet-500 text-white"
      }
    };
  }
  
  // High: Ready buyer with matches
  if ((financeStatus === 'ready_to_progress' || financeStatus === 'strong_buyer') && excellentMatches > 0) {
    return {
      show: true,
      headline: "Finance ready — time to convert",
      explanation: `Buyer is financially qualified with ${excellentMatches} excellent match${excellentMatches > 1 ? 'es' : ''}. Window of opportunity is open — buyer fatigue increases with each rejected viewing.`,
      action: "Present matches and schedule viewings",
      urgencyLabel: "High",
      icon: TrendingUp,
      styles: {
        container: "bg-emerald-500/[0.05] border-emerald-500/20",
        iconBg: "bg-emerald-500/10",
        icon: "text-emerald-400",
        title: "text-emerald-400",
        badge: "bg-emerald-500 text-white"
      }
    };
  }
  
  // Warning: Stale buyer
  if (daysSinceActivity > 14) {
    return {
      show: true,
      headline: "Buyer going cold — reactivation needed",
      explanation: `${daysSinceActivity} days without contact. Even serious buyers lose momentum or find alternatives. Re-engagement cost is lower than sourcing new qualified buyers.`,
      action: "Send fresh property alert or market update",
      urgencyLabel: "Warning",
      icon: Clock,
      styles: {
        container: "bg-white/[0.03] border-white/[0.08]",
        iconBg: "bg-white/[0.06]",
        icon: "text-white/60",
        title: "text-white/80",
        badge: "bg-white/20 text-white"
      }
    };
  }
  
  // Normal: High seriousness but no matches
  if ((buyer.seriousness === 'high' || buyer.seriousness === 'very_high') && matches.length === 0) {
    return {
      show: true,
      headline: "Serious buyer needs inventory",
      explanation: `Qualified, motivated buyer but no current matches. This represents immediate revenue potential if suitable properties can be sourced.`,
      action: "Expand search criteria, check new listings",
      urgencyLabel: "Active",
      icon: AlertCircle,
      styles: {
        container: "bg-blue-500/[0.05] border-blue-500/20",
        iconBg: "bg-blue-500/10",
        icon: "text-blue-400",
        title: "text-blue-400",
        badge: "bg-blue-500/20 text-blue-400"
      }
    };
  }
  
  return { show: false };
}

// ============================================
// TYPES
// ============================================

interface UrgencyAnalysis {
  show: boolean;
  headline?: string;
  explanation?: string;
  action?: string;
  urgencyLabel?: string;
  icon?: React.ElementType;
  styles?: {
    container: string;
    iconBg: string;
    icon: string;
    title: string;
    badge: string;
  };
}
