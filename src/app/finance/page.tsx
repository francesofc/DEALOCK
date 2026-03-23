"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { 
  Plus, 
  FileCheck,
  FileX,
  FileClock,
  FileWarning,
  Wallet,
  UserCircle,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Users
} from "lucide-react";
import { getFinanceProfiles, getBuyers } from "@/lib/data";
import { getFinanceNextAction, urgencyColor } from "@/lib/intelligence/next-actions";
import { FinanceProfile, Buyer, FinanceStatus } from "@/types/database";

// ============================================
// FINANCE READINESS STATES
// ============================================

const statusMap: Record<FinanceStatus, { 
  label: string; 
  shortLabel: string;
  icon: React.ElementType;
  className: string;
  bg: string;
  border: string;
  action: string;
  actionIcon: React.ElementType;
}> = {
  incomplete: { 
    label: "Incomplete", 
    shortLabel: "Action Needed",
    icon: FileX,
    className: "text-amber-400", 
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    action: "Request documents",
    actionIcon: ArrowRight
  },
  under_review: { 
    label: "Under Review", 
    shortLabel: "In Review",
    icon: FileClock,
    className: "text-blue-400", 
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    action: "Check status",
    actionIcon: Clock
  },
  needs_clarification: { 
    label: "Needs Clarification", 
    shortLabel: "Clarify",
    icon: FileWarning,
    className: "text-orange-400", 
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    action: "Contact buyer",
    actionIcon: ArrowRight
  },
  ready_to_progress: { 
    label: "Ready to Progress", 
    shortLabel: "Ready",
    icon: FileCheck,
    className: "text-emerald-400", 
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    action: "Present deals",
    actionIcon: Zap
  },
  strong_buyer: { 
    label: "Strong Buyer", 
    shortLabel: "Strong",
    icon: ShieldCheck,
    className: "text-violet-400", 
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    action: "Priority matching",
    actionIcon: TrendingUp
  },
};

const affordabilityMap = {
  insufficient: { label: "Insufficient", color: "text-red-400", bg: "bg-red-500/10" },
  tight: { label: "Tight", color: "text-amber-400", bg: "bg-amber-500/10" },
  comfortable: { label: "Comfortable", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  strong: { label: "Strong", color: "text-violet-400", bg: "bg-violet-500/10" },
};

const documentLabels: Record<string, string> = {
  id_document: "ID",
  proof_income: "Income",
  bank_statements: "Bank",
  tax_returns: "Tax",
  employment_contract: "Employment",
  existing_property_docs: "Property",
  loan_pre_approval: "Pre-approval",
};

export default function FinancePage() {
  const [profiles, setProfiles] = useState<FinanceProfile[]>([]);
  const [buyers, setBuyers] = useState<Record<string, Buyer>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [profilesData, buyersData] = await Promise.all([
        getFinanceProfiles(),
        getBuyers(),
      ]);
      setProfiles(profilesData);
      setBuyers(buyersData.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}));
      setLoading(false);
    }
    loadData();
  }, []);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Stats
  const stats = {
    total: profiles.length,
    blocked: profiles.filter(p => p.status === 'incomplete' || p.status === 'needs_clarification').length,
    inReview: profiles.filter(p => p.status === 'under_review').length,
    ready: profiles.filter(p => p.status === 'ready_to_progress').length,
    strong: profiles.filter(p => p.status === 'strong_buyer').length,
  };

  // Group by status
  const blockedProfiles = profiles.filter(p => p.status === 'incomplete' || p.status === 'needs_clarification');
  const reviewProfiles = profiles.filter(p => p.status === 'under_review');
  const readyProfiles = profiles.filter(p => p.status === 'ready_to_progress' || p.status === 'strong_buyer');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading finance profiles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
          <p className="text-white/40 mt-1">Buyer readiness and pre-qualification</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          New Profile
        </Button>
      </div>

      {/* PIPELINE STRIP */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <PipelineCard icon={Users} value={stats.total} label="Total" color="default" />
        <PipelineCard icon={AlertTriangle} value={stats.blocked} label="Blocked" color="amber" />
        <PipelineCard icon={Clock} value={stats.inReview} label="In Review" color="blue" />
        <PipelineCard icon={CheckCircle} value={stats.ready} label="Ready" color="emerald" />
        <PipelineCard icon={ShieldCheck} value={stats.strong} label="Strong" color="violet" />
      </div>

      {/* PROFILES BY STATUS */}
      <div className="space-y-8">
        
        {/* BLOCKED */}
        {blockedProfiles.length > 0 && (
          <section>
            <StatusHeader 
              icon={AlertTriangle}
              title="Action Required"
              subtitle={`${blockedProfiles.length} buyers blocked - documentation needed`}
              color="amber"
            />
            <div className="space-y-3">
              {blockedProfiles
                .sort((a, b) => b.completion_percentage - a.completion_percentage)
                .map(profile => (
                  <FinanceCard key={profile.id} profile={profile} buyer={buyers[profile.buyer_id]} />
                ))}
            </div>
          </section>
        )}

        {/* IN REVIEW */}
        {reviewProfiles.length > 0 && (
          <section>
            <StatusHeader 
              icon={Clock}
              title="Under Review"
              subtitle={`${reviewProfiles.length} profiles being verified`}
              color="blue"
            />
            <div className="space-y-3">
              {reviewProfiles.map(profile => (
                <FinanceCard key={profile.id} profile={profile} buyer={buyers[profile.buyer_id]} />
              ))}
            </div>
          </section>
        )}

        {/* READY / STRONG */}
        {readyProfiles.length > 0 && (
          <section>
            <StatusHeader 
              icon={ShieldCheck}
              title="Ready to Proceed"
              subtitle={`${readyProfiles.length} buyers cleared for transactions`}
              color="emerald"
            />
            <div className="space-y-3">
              {readyProfiles
                .sort((a, b) => {
                  if (a.status === 'strong_buyer' && b.status !== 'strong_buyer') return -1;
                  if (b.status === 'strong_buyer' && a.status !== 'strong_buyer') return 1;
                  return (b.estimated_max_budget || 0) - (a.estimated_max_budget || 0);
                })
                .map(profile => (
                  <FinanceCard key={profile.id} profile={profile} buyer={buyers[profile.buyer_id]} />
                ))}
            </div>
          </section>
        )}
      </div>

      {/* EMPTY STATE */}
      {profiles.length === 0 && (
        <div className="text-center py-20 surface-subtle rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-medium mb-2">No finance profiles yet</h3>
          <p className="text-white/40 text-sm mb-6">Track buyer readiness and documentation</p>
          <Button className="gap-2 bg-white text-black hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Create First Profile
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// FINANCE CARD
// ============================================

function FinanceCard({ profile, buyer }: { profile: FinanceProfile; buyer: Buyer | undefined }) {
  if (!buyer) return null;
  
  const status = statusMap[profile.status];
  const StatusIcon = status.icon;
  const ActionIcon = status.actionIcon;
  const affordability = profile.affordability_status ? affordabilityMap[profile.affordability_status] : null;
  
  // Get next action intelligence
  const nextAction = getFinanceNextAction(profile, []);
  
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className={`p-5 rounded-2xl ${status.bg} ${status.border} border hover:brightness-110 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-white/60" />
          </div>
          <div>
            <h3 className="font-medium">{buyer.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.06]`}>
                <StatusIcon className={`w-3.5 h-3.5 ${status.className}`} />
                <span className={`text-xs font-medium ${status.className}`}>{status.shortLabel}</span>
              </div>
              {buyer.pre_approved && (
                <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px]">
                  Pre-approved
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Max Budget */}
        <div className="text-right">
          <p className="text-2xl font-semibold">{formatCurrency(profile.estimated_max_budget)}</p>
          <p className="text-xs text-white/40">max budget</p>
        </div>
      </div>
      
      {/* Financial Grid */}
      <div className="grid grid-cols-4 gap-4 py-4 border-y border-white/[0.06]">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Income</p>
          <p className="text-lg font-medium">{formatCurrency(profile.annual_income)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Down Payment</p>
          <p className="text-lg font-medium">{formatCurrency(profile.available_down_payment)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Est. Monthly</p>
          <p className="text-lg font-medium">{formatCurrency(profile.estimated_monthly_payment)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Position</p>
          <p className={`text-lg font-medium ${affordability?.color || 'text-white/50'}`}>
            {affordability?.label || 'Unknown'}
          </p>
        </div>
      </div>
      
      {/* Next Action Intelligence */}
      <div className={`p-3 rounded-xl border mb-4 ${urgencyColor(nextAction.urgency)}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
            nextAction.urgency === 'critical' ? 'bg-red-500 text-white' :
            nextAction.urgency === 'high' ? 'bg-amber-500 text-black' :
            nextAction.urgency === 'normal' ? 'bg-blue-500 text-white' :
            'bg-white/20 text-white'
          }`}>
            {nextAction.urgency}
          </span>
          <span className="text-sm font-medium">{nextAction.action}</span>
        </div>
        <p className="text-xs text-white/60">{nextAction.reason}</p>
        {nextAction.suggested && (
          <p className="text-xs text-white/40 mt-1">{nextAction.suggested}</p>
        )}
      </div>
      
      {/* Documents & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="w-28">
              <Progress value={profile.completion_percentage} className="h-2" />
            </div>
            <span className="text-sm text-white/50">
              {profile.completion_percentage}%
            </span>
          </div>
          
          {/* Missing Docs */}
          {profile.missing_documents.length > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400">
                {profile.missing_documents.slice(0, 2).map(d => documentLabels[d] || d).join(', ')}
                {profile.missing_documents.length > 2 && ` +${profile.missing_documents.length - 2}`}
              </span>
            </div>
          )}
        </div>
        
        <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90">
          <ActionIcon className="w-3.5 h-3.5" />
          {status.action}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function PipelineCard({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ElementType; 
  value: number; 
  label: string; 
  color: 'default' | 'amber' | 'blue' | 'emerald' | 'violet';
}) {
  const colors = {
    default: "bg-white/[0.06] text-white/60",
    amber: "bg-amber-500/10 text-amber-400",
    blue: "bg-blue-500/10 text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    violet: "bg-violet-500/10 text-violet-400",
  };
  
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function StatusHeader({ 
  icon: Icon,
  title,
  subtitle,
  color
}: { 
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: 'amber' | 'blue' | 'emerald';
}) {
  const colors = {
    amber: "bg-amber-500/10 text-amber-400",
    blue: "bg-blue-500/10 text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
  };
  
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-white/40">{subtitle}</p>
      </div>
    </div>
  );
}
