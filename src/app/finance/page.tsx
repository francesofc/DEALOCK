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
  Zap
} from "lucide-react";
import { getFinanceProfiles, getBuyers } from "@/lib/data";
import { FinanceProfile, Buyer, FinanceStatus } from "@/types/database";

// ============================================
// FINANCE READINESS LOGIC
// ============================================
// Clear progression: incomplete → review → ready → strong

const statusMap: Record<FinanceStatus, { 
  label: string; 
  shortLabel: string;
  icon: React.ElementType;
  className: string;
  bg: string;
  border: string;
  description: string;
  action: string;
}> = {
  incomplete: { 
    label: "Incomplete", 
    shortLabel: "Action Needed",
    icon: FileX,
    className: "text-amber-400", 
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    description: "Missing required documents",
    action: "Request documents"
  },
  under_review: { 
    label: "Under Review", 
    shortLabel: "In Review",
    icon: FileClock,
    className: "text-blue-400", 
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description: "Documents being verified",
    action: "Follow up in 24h"
  },
  needs_clarification: { 
    label: "Needs Clarification", 
    shortLabel: "Clarify",
    icon: FileWarning,
    className: "text-orange-400", 
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    description: "Additional information required",
    action: "Contact buyer"
  },
  ready_to_progress: { 
    label: "Ready to Progress", 
    shortLabel: "Ready",
    icon: FileCheck,
    className: "text-emerald-400", 
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    description: "Cleared to make offers",
    action: "Present opportunities"
  },
  strong_buyer: { 
    label: "Strong Buyer", 
    shortLabel: "Strong",
    icon: ShieldCheck,
    className: "text-violet-400", 
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    description: "Excellent financial position",
    action: "Priority matching"
  },
};

const affordabilityMap = {
  insufficient: { label: "Insufficient", color: "text-red-400", bg: "bg-red-500/10" },
  tight: { label: "Tight", color: "text-amber-400", bg: "bg-amber-500/10" },
  comfortable: { label: "Comfortable", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  strong: { label: "Strong", color: "text-violet-400", bg: "bg-violet-500/10" },
};

// Document type labels
const documentLabels: Record<string, string> = {
  id_document: "ID",
  proof_income: "Income",
  bank_statements: "Bank Statements",
  tax_returns: "Tax Returns",
  employment_contract: "Employment",
  existing_property_docs: "Property Docs",
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

  // Calculate stats
  const stats = {
    total: profiles.length,
    blocked: profiles.filter(p => p.status === 'incomplete' || p.status === 'needs_clarification').length,
    inReview: profiles.filter(p => p.status === 'under_review').length,
    ready: profiles.filter(p => p.status === 'ready_to_progress').length,
    strong: profiles.filter(p => p.status === 'strong_buyer').length,
  };

  // Categorize profiles
  const blockedProfiles = profiles.filter(p => p.status === 'incomplete' || p.status === 'needs_clarification');
  const reviewProfiles = profiles.filter(p => p.status === 'under_review');
  const readyProfiles = profiles.filter(p => p.status === 'ready_to_progress' || p.status === 'strong_buyer');

  // Sort each category by completion percentage
  const sortByCompletion = (a: FinanceProfile, b: FinanceProfile) => b.completion_percentage - a.completion_percentage;

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

      {/* READINESS PIPELINE STRIP */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <PipelineCard 
          icon={Wallet} 
          value={stats.total} 
          label="Total Profiles" 
          color="default"
        />
        <PipelineCard 
          icon={AlertTriangle} 
          value={stats.blocked} 
          label="Blocked" 
          color="amber"
        />
        <PipelineCard 
          icon={Clock} 
          value={stats.inReview} 
          label="In Review" 
          color="blue"
        />
        <PipelineCard 
          icon={CheckCircle} 
          value={stats.ready} 
          label="Ready" 
          color="emerald"
        />
        <PipelineCard 
          icon={ShieldCheck} 
          value={stats.strong} 
          label="Strong Buyers" 
          color="violet"
        />
      </div>

      {/* MAIN CONTENT: Grouped by status */}
      <div className="space-y-8">
        
        {/* BLOCKED - Action Required */}
        {blockedProfiles.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="font-medium">Action Required</h2>
                <p className="text-sm text-white/40">{blockedProfiles.length} buyers blocked - documentation needed</p>
              </div>
            </div>
            <div className="space-y-3">
              {blockedProfiles.sort(sortByCompletion).map(profile => (
                <FinanceCard key={profile.id} profile={profile} buyer={buyers[profile.buyer_id]} />
              ))}
            </div>
          </section>
        )}

        {/* IN REVIEW */}
        {reviewProfiles.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="font-medium">Under Review</h2>
                <p className="text-sm text-white/40">{reviewProfiles.length} profiles being verified</p>
              </div>
            </div>
            <div className="space-y-3">
              {reviewProfiles.sort(sortByCompletion).map(profile => (
                <FinanceCard key={profile.id} profile={profile} buyer={buyers[profile.buyer_id]} />
              ))}
            </div>
          </section>
        )}

        {/* READY / STRONG */}
        {readyProfiles.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-medium">Ready to Proceed</h2>
                <p className="text-sm text-white/40">{readyProfiles.length} buyers cleared for transactions</p>
              </div>
            </div>
            <div className="space-y-3">
              {readyProfiles
                .sort((a, b) => {
                  // Strong buyers first, then by max budget
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

// Finance Card Component
function FinanceCard({ profile, buyer }: { profile: FinanceProfile; buyer: Buyer | undefined }) {
  if (!buyer) return null;
  
  const status = statusMap[profile.status];
  const StatusIcon = status.icon;
  const affordability = profile.affordability_status ? affordabilityMap[profile.affordability_status] : null;
  
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className={`group p-5 rounded-2xl ${status.bg} ${status.border} border hover:brightness-110 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-white/60" />
          </div>
          <div>
            <h3 className="font-medium">{buyer.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-sm ${status.className}`}>{status.shortLabel}</span>
              {buyer.pre_approved && (
                <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px]">
                  Bank Pre-approved
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06]`}>
          <StatusIcon className={`w-4 h-4 ${status.className}`} />
          <span className={`text-sm font-medium ${status.className}`}>{status.label}</span>
        </div>
      </div>
      
      {/* Financials Grid */}
      <div className="grid grid-cols-4 gap-4 py-4 border-y border-white/[0.06]">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Annual Income</p>
          <p className="text-lg font-medium">{formatCurrency(profile.annual_income)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Down Payment</p>
          <p className="text-lg font-medium">{formatCurrency(profile.available_down_payment)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Max Budget</p>
          <p className="text-lg font-medium">{formatCurrency(profile.estimated_max_budget)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Position</p>
          <p className={`text-lg font-medium ${affordability?.color || 'text-white/50'}`}>
            {affordability?.label || 'Unknown'}
          </p>
        </div>
      </div>
      
      {/* Documents & Action */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          {/* Document Progress */}
          <div className="flex items-center gap-3">
            <div className="w-32">
              <Progress value={profile.completion_percentage} className="h-2" />
            </div>
            <span className="text-sm text-white/50">
              {profile.completion_percentage}% complete
            </span>
          </div>
          
          {/* Missing Docs Preview */}
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
          <Zap className="w-3.5 h-3.5" />
          {status.action}
        </Button>
      </div>
    </div>
  );
}

// Helper Components

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
