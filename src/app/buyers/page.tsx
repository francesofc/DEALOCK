"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Wallet,
  Calendar,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  FileCheck
} from "lucide-react";
import { getBuyers, getFinanceProfileByBuyer } from "@/lib/data";
import { Buyer, BuyerStatus, FinanceProfile } from "@/types/database";

// ============================================
// BUYER STATUS LOGIC
// ============================================
// Dual-track: Seriousness × Qualification

const statusMap: Record<BuyerStatus, { 
  label: string; 
  className: string;
  description: string;
}> = {
  new: { 
    label: "New", 
    className: "bg-white/[0.06] text-white/60",
    description: "Initial contact needed"
  },
  contacted: { 
    label: "Contacted", 
    className: "bg-amber-500/15 text-amber-400",
    description: "Follow-up required"
  },
  qualified: { 
    label: "Qualified", 
    className: "bg-blue-500/15 text-blue-400",
    description: "Criteria confirmed"
  },
  viewing_scheduled: { 
    label: "Viewing", 
    className: "bg-violet-500/15 text-violet-400",
    description: "Active viewing"
  },
  offer_pending: { 
    label: "Offer", 
    className: "bg-orange-500/15 text-orange-400",
    description: "Offer in progress"
  },
  closed: { 
    label: "Closed", 
    className: "bg-emerald-500/15 text-emerald-400",
    description: "Transaction complete"
  },
  inactive: { 
    label: "Inactive", 
    className: "bg-red-500/15 text-red-400",
    description: "Paused / lost"
  },
};

// Seriousness levels with visual indicators
const seriousnessMap = {
  low: { 
    label: "Browsing", 
    color: "text-white/40",
    bg: "bg-white/[0.04]",
    icon: Clock
  },
  medium: { 
    label: "Interested", 
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    icon: Target
  },
  high: { 
    label: "Serious", 
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: TrendingUp
  },
  very_high: { 
    label: "Committed", 
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    icon: CheckCircle2
  },
};

// Timeline indicators
const timelineMap = {
  browsing: { label: "Browsing", color: "text-white/40", urgency: "low" },
  '3_months': { label: "3 months", color: "text-amber-400", urgency: "medium" },
  '1_month': { label: "1 month", color: "text-emerald-400", urgency: "high" },
  immediate: { label: "Immediate", color: "text-violet-400", urgency: "urgent" },
};

// Combined qualification state
function getQualificationState(buyer: Buyer, finance: FinanceProfile | null): {
  state: 'new' | 'contacted' | 'qualified' | 'verified' | 'finance_ready' | 'blocked';
  label: string;
  color: string;
} {
  if (buyer.status === 'new') return { state: 'new', label: 'New Lead', color: 'text-white/50' };
  if (buyer.status === 'contacted') return { state: 'contacted', label: 'Contacted', color: 'text-amber-400' };
  if (!finance || finance.completion_percentage < 50) {
    return { state: 'qualified', label: 'Qualified', color: 'text-blue-400' };
  }
  if (finance.status === 'needs_clarification' || finance.status === 'incomplete') {
    return { state: 'blocked', label: 'Finance Blocked', color: 'text-red-400' };
  }
  if (finance.status === 'under_review') {
    return { state: 'verified', label: 'Under Review', color: 'text-amber-400' };
  }
  return { state: 'finance_ready', label: 'Finance Ready', color: 'text-emerald-400' };
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [financeMap, setFinanceMap] = useState<Record<string, FinanceProfile | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuyers() {
      const data = await getBuyers();
      setBuyers(data);
      
      const profiles: Record<string, FinanceProfile | null> = {};
      for (const buyer of data) {
        profiles[buyer.id] = await getFinanceProfileByBuyer(buyer.id);
      }
      setFinanceMap(profiles);
      setLoading(false);
    }
    loadBuyers();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const stats = {
    total: buyers.length,
    financeReady: buyers.filter(b => {
      const f = financeMap[b.id];
      return f && (f.status === 'ready_to_progress' || f.status === 'strong_buyer');
    }).length,
    urgent: buyers.filter(b => b.timeline === 'immediate' && b.seriousness === 'very_high').length,
    blocked: buyers.filter(b => {
      const f = financeMap[b.id];
      return f && (f.status === 'incomplete' || f.status === 'needs_clarification');
    }).length,
    committed: buyers.filter(b => b.seriousness === 'high' || b.seriousness === 'very_high').length,
  };

  // Sort buyers: urgent first, then by seriousness, then by qualification
  const sortedBuyers = [...buyers].sort((a, b) => {
    const aFinance = financeMap[a.id];
    const bFinance = financeMap[b.id];
    
    // Urgent timeline first
    if (a.timeline === 'immediate' && b.timeline !== 'immediate') return -1;
    if (b.timeline === 'immediate' && a.timeline !== 'immediate') return 1;
    
    // High seriousness next
    const seriousnessOrder = { very_high: 3, high: 2, medium: 1, low: 0 };
    if (seriousnessOrder[a.seriousness] !== seriousnessOrder[b.seriousness]) {
      return seriousnessOrder[b.seriousness] - seriousnessOrder[a.seriousness];
    }
    
    // Finance ready next
    const aReady = aFinance?.status === 'ready_to_progress' || aFinance?.status === 'strong_buyer' ? 1 : 0;
    const bReady = bFinance?.status === 'ready_to_progress' || bFinance?.status === 'strong_buyer' ? 1 : 0;
    return bReady - aReady;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading buyers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Buyers</h1>
          <p className="text-white/40 mt-1">Buyer qualification workspace</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          Add Buyer
        </Button>
      </div>

      {/* SUMMARY STRIP */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <SummaryCard icon={Users} value={stats.total} label="Total Buyers" color="default" />
        <SummaryCard icon={CheckCircle2} value={stats.financeReady} label="Finance Ready" color="emerald" />
        <SummaryCard icon={Zap} value={stats.urgent} label="Urgent" color="violet" />
        <SummaryCard icon={TrendingUp} value={stats.committed} label="Committed" color="blue" />
        <SummaryCard icon={AlertCircle} value={stats.blocked} label="Blocked" color="red" />
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search by name, area, or budget..."
            className="pl-11 bg-white/[0.03] border-white/[0.06] focus:border-white/10"
          />
        </div>
        <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* BUYERS TABLE HEADER */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-white/40 uppercase tracking-wider">
        <div className="col-span-3">Buyer</div>
        <div className="col-span-2">Qualification</div>
        <div className="col-span-2">Target / Budget</div>
        <div className="col-span-2">Timeline</div>
        <div className="col-span-2">Finance</div>
        <div className="col-span-1"></div>
      </div>

      {/* BUYERS LIST */}
      <div className="space-y-2">
        {sortedBuyers.map((buyer) => {
          const status = statusMap[buyer.status];
          const seriousness = seriousnessMap[buyer.seriousness];
          const timeline = timelineMap[buyer.timeline];
          const finance = financeMap[buyer.id];
          const qualification = getQualificationState(buyer, finance);
          const SeriousnessIcon = seriousness.icon;
          
          return (
            <div 
              key={buyer.id}
              className="group grid grid-cols-12 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all cursor-pointer items-center"
            >
              {/* Buyer Info */}
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${seriousness.bg} flex items-center justify-center`}>
                    <SeriousnessIcon className={`w-5 h-5 ${seriousness.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{buyer.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className={`text-[10px] ${status.className}`}>
                        {status.label}
                      </Badge>
                      {buyer.pre_approved && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px]">
                          Pre-approved
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualification State */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${qualification.color}`}>
                    {qualification.label}
                  </span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">{status.description}</p>
              </div>

              {/* Target / Budget */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-white/70 truncate">
                    {buyer.target_areas[0]}
                    {buyer.target_areas.length > 1 && ` +${buyer.target_areas.length - 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm mt-1">
                  <Wallet className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-white/50">
                    {formatCurrency(buyer.budget_max)}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-white/30" />
                  <span className={`text-sm ${timeline.color}`}>{timeline.label}</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">Seriousness: {seriousness.label}</p>
              </div>

              {/* Finance */}
              <div className="col-span-2">
                {finance ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 max-w-20">
                        <Progress value={finance.completion_percentage} className="h-1.5" />
                      </div>
                      <span className="text-xs text-white/50">{finance.completion_percentage}%</span>
                    </div>
                    <p className="text-xs text-white/40">
                      {finance.status === 'strong_buyer' ? 'Strong buyer' :
                       finance.status === 'ready_to_progress' ? 'Ready to proceed' :
                       finance.status === 'under_review' ? 'Under review' :
                       finance.status === 'needs_clarification' ? 'Needs docs' :
                       'Incomplete'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-white/30">No profile</p>
                )}
              </div>

              {/* Action */}
              <div className="col-span-1 flex justify-end">
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {buyers.length === 0 && (
        <div className="text-center py-20 surface-subtle rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-medium mb-2">No buyers yet</h3>
          <p className="text-white/40 text-sm mb-6">Start building your buyer network</p>
          <Button className="gap-2 bg-white text-black hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Add First Buyer
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper Components

function SummaryCard({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ElementType; 
  value: number; 
  label: string; 
  color: 'default' | 'emerald' | 'violet' | 'blue' | 'red';
}) {
  const colors = {
    default: "bg-white/[0.06] text-white/60",
    emerald: "bg-emerald-500/10 text-emerald-400",
    violet: "bg-violet-500/10 text-violet-400",
    blue: "bg-blue-500/10 text-blue-400",
    red: "bg-red-500/10 text-red-400",
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
