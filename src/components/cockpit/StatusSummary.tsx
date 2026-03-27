"use client";

import { 
  FileSignature, 
  Clock, 
  Puzzle, 
  Heart, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  Wallet,
  ShieldCheck,
  Calendar
} from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface SellerStatusSummary {
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

export interface BuyerStatusSummary {
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

interface StatusIndicatorProps {
  icon: React.ElementType;
  label: string;
  value: string;
  status: 'critical' | 'warning' | 'good' | 'excellent' | 'neutral';
  detail: string;
}

// ============================================
// SELLER STATUS SUMMARY COMPONENT
// ============================================

interface SellerStatusSummaryProps {
  summary: SellerStatusSummary;
}

export function SellerStatusSummaryCard({ summary }: SellerStatusSummaryProps) {
  const indicators: StatusIndicatorProps[] = [
    {
      icon: FileSignature,
      label: "Mandate",
      value: getMandateLabel(summary.mandateStatus),
      status: getMandateStatus(summary.mandateStatus),
      detail: summary.mandateStatus === 'none' 
        ? `${summary.mandateReadiness}% ready`
        : summary.mandateStatus === 'signed' 
          ? 'Exclusivity secured'
          : 'Signature pending'
    },
    {
      icon: Clock,
      label: "Activity",
      value: getActivityLabel(summary.activityStatus),
      status: mapActivityStatus(summary.activityStatus),
      detail: summary.daysSinceActivity > 99 
        ? 'No activity yet'
        : `${summary.daysSinceActivity} days since last contact`
    },
    {
      icon: Puzzle,
      label: "Matches",
      value: summary.matchCount > 0 ? `${summary.matchCount} found` : 'None yet',
      status: summary.hasExcellentMatches ? 'excellent' : summary.matchCount > 0 ? 'good' : 'neutral',
      detail: summary.hasExcellentMatches 
        ? 'Excellent matches ready'
        : summary.matchCount > 0 
          ? 'Matches available'
          : 'Needs mandate first'
    },
    {
      icon: Heart,
      label: "Relationship",
      value: formatRelationship(summary.relationshipState),
      status: getRelationshipStatus(summary.relationshipState),
      detail: getRelationshipDetail(summary.relationshipState)
    }
  ];

  return (
    <div className="surface-elevated rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-medium">Dossier Status</h2>
            <p className="text-sm text-white/40">Where this seller stands</p>
          </div>
        </div>
        {summary.estimatedRevenue > 0 && (
          <div className="text-right">
            <p className="text-xs text-white/40 uppercase tracking-wider">Est. Commission</p>
            <p className="text-lg font-semibold text-emerald-400">
              {formatCurrency(summary.estimatedRevenue)}
            </p>
          </div>
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {indicators.map((indicator, i) => (
          <StatusIndicator key={i} {...indicator} />
        ))}
      </div>

      {/* Next Milestone */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-white/40 uppercase tracking-wider">Next Milestone</span>
        </div>
        <p className="text-white/80">{summary.nextMilestone}</p>
      </div>
    </div>
  );
}

// ============================================
// BUYER STATUS SUMMARY COMPONENT
// ============================================

interface BuyerStatusSummaryProps {
  summary: BuyerStatusSummary;
}

export function BuyerStatusSummaryCard({ summary }: BuyerStatusSummaryProps) {
  const indicators: StatusIndicatorProps[] = [
    {
      icon: Wallet,
      label: "Finance",
      value: getFinanceLabel(summary.financeStatus),
      status: getFinanceStatus(summary.financeStatus),
      detail: `${summary.financeCompletion}% complete`
    },
    {
      icon: Puzzle,
      label: "Matches",
      value: summary.matchCount > 0 ? `${summary.matchCount}` : 'None',
      status: summary.excellentMatches > 0 ? 'excellent' : summary.matchCount > 0 ? 'good' : 'neutral',
      detail: summary.excellentMatches > 0 
        ? `${summary.excellentMatches} excellent`
        : summary.matchCount > 0 
          ? 'Opportunities ready'
          : 'Search needed'
    },
    {
      icon: Calendar,
      label: "Timeline",
      value: formatTimeline(summary.timeline),
      status: getTimelineStatus(summary.timeline),
      detail: getTimelineUrgency(summary.timeline)
    },
    {
      icon: TrendingUp,
      label: "Engagement",
      value: formatSeriousness(summary.seriousness),
      status: getSeriousnessStatus(summary.seriousness),
      detail: summary.isPreApproved ? 'Pre-approved ✓' : 'Approval needed'
    }
  ];

  const blockers = getBuyerBlockers(summary);

  return (
    <div className="surface-elevated rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-medium">Buyer Readiness</h2>
            <p className="text-sm text-white/40">Qualification and opportunities</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40 uppercase tracking-wider">Max Budget</p>
          <p className="text-lg font-semibold">
            {formatCurrency(summary.maxBudget)}
          </p>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {indicators.map((indicator, i) => (
          <StatusIndicator key={i} {...indicator} />
        ))}
      </div>

      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/10">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-400 uppercase tracking-wider">
              {blockers.length} Blocker{blockers.length > 1 ? 's' : ''} to Progress
            </span>
          </div>
          <div className="space-y-2">
            {blockers.map((blocker, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <p className="text-sm text-white/70">{blocker}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {blockers.length === 0 && summary.excellentMatches > 0 && (
        <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">
              Ready to proceed — {summary.excellentMatches} excellent match{summary.excellentMatches > 1 ? 'es' : ''} waiting
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatusIndicator({ icon: Icon, label, value, status, detail }: StatusIndicatorProps) {
  const statusColors = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    good: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    excellent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral: 'bg-white/[0.04] text-white/60 border-white/[0.06]'
  };

  return (
    <div className={`p-4 rounded-xl border ${statusColors[status]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 opacity-60" />
        <span className="text-[10px] uppercase tracking-wider opacity-60">{label}</span>
      </div>
      <p className="text-sm font-medium mb-1">{value}</p>
      <p className="text-xs opacity-50">{detail}</p>
    </div>
  );
}

// ============================================
// FORMATTING HELPERS
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMandateLabel(status: string): string {
  const labels: Record<string, string> = {
    none: 'Not started',
    draft: 'Draft',
    sent: 'Sent',
    signed: 'Signed'
  };
  return labels[status] || status;
}

function getMandateStatus(status: string): 'critical' | 'warning' | 'good' | 'excellent' | 'neutral' {
  switch (status) {
    case 'signed': return 'excellent';
    case 'sent': return 'good';
    case 'draft': return 'warning';
    case 'none': return 'neutral';
    default: return 'neutral';
  }
}

function getActivityLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Active',
    recent: 'Recent',
    stale: 'Stale',
    critical: 'Critical'
  };
  return labels[status] || status;
}

function mapActivityStatus(status: string): 'critical' | 'warning' | 'good' | 'excellent' | 'neutral' {
  switch (status) {
    case 'active': return 'excellent';
    case 'recent': return 'good';
    case 'stale': return 'warning';
    case 'critical': return 'critical';
    default: return 'neutral';
  }
}

function formatRelationship(state: string): string {
  return state.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getRelationshipStatus(state: string): 'critical' | 'warning' | 'good' | 'excellent' | 'neutral' {
  switch (state) {
    case 'committed': return 'excellent';
    case 'engaged': return 'good';
    case 'warming': return 'warning';
    case 'cold': return 'neutral';
    default: return 'neutral';
  }
}

function getRelationshipDetail(state: string): string {
  switch (state) {
    case 'committed': return 'Ready to sign';
    case 'engaged': return 'In conversation';
    case 'warming': return 'Building trust';
    case 'cold': return 'Initial contact';
    default: return 'Unknown';
  }
}

function getFinanceLabel(status: string): string {
  const labels: Record<string, string> = {
    incomplete: 'Incomplete',
    under_review: 'Reviewing',
    ready_to_progress: 'Ready',
    strong_buyer: 'Strong'
  };
  return labels[status] || status;
}

function getFinanceStatus(status: string): 'critical' | 'warning' | 'good' | 'excellent' | 'neutral' {
  switch (status) {
    case 'strong_buyer': return 'excellent';
    case 'ready_to_progress': return 'good';
    case 'under_review': return 'warning';
    case 'incomplete': return 'critical';
    default: return 'neutral';
  }
}

function formatTimeline(timeline: string): string {
  const labels: Record<string, string> = {
    browsing: 'Browsing',
    '3_months': '3 months',
    '1_month': '1 month',
    immediate: 'Immediate'
  };
  return labels[timeline] || timeline;
}

function getTimelineStatus(timeline: string): 'critical' | 'warning' | 'good' | 'excellent' | 'neutral' {
  switch (timeline) {
    case 'immediate': return 'excellent';
    case '1_month': return 'good';
    case '3_months': return 'warning';
    case 'browsing': return 'neutral';
    default: return 'neutral';
  }
}

function getTimelineUrgency(timeline: string): string {
  switch (timeline) {
    case 'immediate': return 'Act now';
    case '1_month': return 'This month';
    case '3_months': return 'Q1 target';
    case 'browsing': return 'Long-term';
    default: return '';
  }
}

function formatSeriousness(level: string): string {
  const labels: Record<string, string> = {
    low: 'Browsing',
    medium: 'Interested',
    high: 'Serious',
    very_high: 'Committed'
  };
  return labels[level] || level;
}

function getSeriousnessStatus(level: string): 'critical' | 'warning' | 'good' | 'excellent' | 'neutral' {
  switch (level) {
    case 'very_high': return 'excellent';
    case 'high': return 'good';
    case 'medium': return 'warning';
    case 'low': return 'neutral';
    default: return 'neutral';
  }
}

function getBuyerBlockers(summary: BuyerStatusSummary): string[] {
  const blockers: string[] = [];
  
  if (summary.financeStatus === 'incomplete') {
    blockers.push('Finance documents incomplete — cannot make offers');
  } else if (summary.financeStatus === 'under_review') {
    blockers.push('Finance under review — wait for approval');
  }
  
  if (summary.activityStatus === 'stale' || summary.activityStatus === 'critical') {
    blockers.push(`No contact for ${summary.daysSinceActivity} days — re-engage needed`);
  }
  
  if (!summary.isPreApproved && summary.timeline === 'immediate') {
    blockers.push('Timeline is immediate but no pre-approval — urgency mismatch');
  }
  
  return blockers;
}
