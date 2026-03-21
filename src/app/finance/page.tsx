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
  Clock
} from "lucide-react";
import { getFinanceProfiles, getBuyers } from "@/lib/data";
import { FinanceProfile, Buyer, FinanceStatus } from "@/types/database";

const statusMap: Record<FinanceStatus, { 
  label: string; 
  icon: React.ElementType;
  className: string;
  bg: string;
}> = {
  incomplete: { 
    label: "Incomplete", 
    icon: FileX,
    className: "text-amber-400", 
    bg: "bg-amber-500/10" 
  },
  under_review: { 
    label: "Under Review", 
    icon: FileClock,
    className: "text-blue-400", 
    bg: "bg-blue-500/10" 
  },
  needs_clarification: { 
    label: "Needs Clarification", 
    icon: FileWarning,
    className: "text-orange-400", 
    bg: "bg-orange-500/10" 
  },
  ready_to_progress: { 
    label: "Ready", 
    icon: FileCheck,
    className: "text-emerald-400", 
    bg: "bg-emerald-500/10" 
  },
  strong_buyer: { 
    label: "Strong Buyer", 
    icon: CheckCircle,
    className: "text-violet-400", 
    bg: "bg-violet-500/10" 
  },
};

const affordabilityMap = {
  insufficient: { label: "Insufficient", color: "text-red-400" },
  tight: { label: "Tight", color: "text-amber-400" },
  comfortable: { label: "Comfortable", color: "text-emerald-400" },
  strong: { label: "Strong", color: "text-violet-400" },
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
    incomplete: profiles.filter(p => p.status === 'incomplete').length,
    underReview: profiles.filter(p => p.status === 'under_review').length,
    ready: profiles.filter(p => p.status === 'ready_to_progress' || p.status === 'strong_buyer').length,
  };

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
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
          <p className="text-white/40 mt-1">Buyer readiness and pre-qualification</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          New Profile
        </Button>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-sm text-white/40 mb-1">Total Profiles</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm text-amber-400/70 mb-1">Incomplete</p>
          <p className="text-2xl font-semibold text-amber-400">{stats.incomplete}</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-sm text-blue-400/70 mb-1">Under Review</p>
          <p className="text-2xl font-semibold text-blue-400">{stats.underReview}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-sm text-emerald-400/70 mb-1">Ready / Strong</p>
          <p className="text-2xl font-semibold text-emerald-400">{stats.ready}</p>
        </div>
      </div>

      {/* PROFILES LIST */}
      <div className="space-y-3">
        {profiles.map((profile) => {
          const buyer = buyers[profile.buyer_id];
          const status = statusMap[profile.status];
          const StatusIcon = status.icon;
          const affordability = profile.affordability_status ? affordabilityMap[profile.affordability_status] : null;
          
          if (!buyer) return null;
          
          return (
            <div 
              key={profile.id}
              className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all"
            >
              <div className="flex items-start justify-between">
                {/* Left: Buyer Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-white/50" />
                  </div>
                  <div>
                    <h3 className="font-medium">{buyer.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-white/50">{buyer.email}</span>
                      {buyer.pre_approved && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">
                          Pre-approved
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right: Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${status.className}`} />
                  <span className={`text-sm font-medium ${status.className}`}>{status.label}</span>
                </div>
              </div>
              
              {/* Middle: Financials */}
              <div className="grid grid-cols-4 gap-4 mt-5 py-4 border-y border-white/[0.04]">
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
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Affordability</p>
                  <p className={`text-lg font-medium ${affordability?.color || 'text-white/50'}`}>
                    {affordability?.label || 'Unknown'}
                  </p>
                </div>
              </div>
              
              {/* Bottom: Documents & Actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  {/* Document Progress */}
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <Progress value={profile.completion_percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-white/50">
                      {profile.completion_percentage}% docs
                    </span>
                  </div>
                  
                  {/* Missing Documents */}
                  {profile.missing_documents.length > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-amber-400">
                        {profile.missing_documents.length} missing
                      </span>
                    </div>
                  )}
                </div>
                
                <Button size="sm" variant="outline" className="gap-1.5 border-white/10 hover:bg-white/[0.04]">
                  Review
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              
              {/* Recommended Actions */}
              {profile.recommended_actions.length > 0 && profile.recommended_actions[0] !== 'Proceed with confidence' && (
                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Recommended Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.recommended_actions.map((action, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-white/60"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
