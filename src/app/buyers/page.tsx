"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Wallet,
  Calendar,
  Target,
  ArrowRight
} from "lucide-react";
import { getBuyers, getFinanceProfileByBuyer } from "@/lib/data";
import { Buyer, BuyerStatus, FinanceProfile } from "@/types/database";

const statusMap: Record<BuyerStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-white/[0.06] text-white/60" },
  contacted: { label: "Contacted", className: "bg-amber-500/15 text-amber-400" },
  qualified: { label: "Qualified", className: "bg-emerald-500/15 text-emerald-400" },
  viewing_scheduled: { label: "Viewing", className: "bg-violet-500/15 text-violet-400" },
  offer_pending: { label: "Offer", className: "bg-orange-500/15 text-orange-400" },
  closed: { label: "Closed", className: "bg-blue-500/15 text-blue-400" },
  inactive: { label: "Inactive", className: "bg-red-500/15 text-red-400" },
};

const seriousnessMap = {
  low: { label: "Browsing", color: "text-white/40" },
  medium: { label: "Interested", color: "text-amber-400" },
  high: { label: "Serious", color: "text-emerald-400" },
  very_high: { label: "Committed", color: "text-violet-400" },
};

const timelineMap = {
  browsing: { label: "Just browsing", color: "text-white/40" },
  '3_months': { label: "3 months", color: "text-amber-400" },
  '1_month': { label: "1 month", color: "text-emerald-400" },
  immediate: { label: "Immediate", color: "text-violet-400" },
};

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [financeProfiles, setFinanceProfiles] = useState<Record<string, FinanceProfile | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuyers() {
      const data = await getBuyers();
      setBuyers(data);
      
      // Load finance profiles
      const profiles: Record<string, FinanceProfile | null> = {};
      for (const buyer of data) {
        profiles[buyer.id] = await getFinanceProfileByBuyer(buyer.id);
      }
      setFinanceProfiles(profiles);
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
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Buyers</h1>
          <p className="text-white/40 mt-1">{buyers.length} buyer relationships</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          Add Buyer
        </Button>
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

      {/* BUYERS LIST */}
      <div className="space-y-2">
        {buyers.map((buyer) => {
          const status = statusMap[buyer.status];
          const seriousness = seriousnessMap[buyer.seriousness];
          const timeline = timelineMap[buyer.timeline];
          const finance = financeProfiles[buyer.id];
          
          return (
            <div 
              key={buyer.id}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all cursor-pointer"
            >
              {/* Buyer Info */}
              <div className="w-56 shrink-0">
                <h3 className="font-medium">{buyer.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-[10px] ${status.className}`}>
                    {status.label}
                  </Badge>
                  {finance?.status === 'strong_buyer' && (
                    <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-0">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Target Areas */}
              <div className="w-48 shrink-0">
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-white/70 truncate">
                    {buyer.target_areas.slice(0, 2).join(', ')}
                    {buyer.target_areas.length > 2 && ` +${buyer.target_areas.length - 2}`}
                  </span>
                </div>
              </div>

              {/* Budget */}
              <div className="w-40 shrink-0">
                <div className="flex items-center gap-1.5 text-sm">
                  <Wallet className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-white/70">
                    {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
                  </span>
                </div>
              </div>

              {/* Seriousness */}
              <div className="w-28 shrink-0">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-white/30" />
                  <span className={`text-sm ${seriousness.color}`}>{seriousness.label}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="w-28 shrink-0">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-white/30" />
                  <span className={`text-sm ${timeline.color}`}>{timeline.label}</span>
                </div>
              </div>

              {/* Next Action */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/50 truncate">{buyer.next_action}</p>
                {buyer.next_action_date && (
                  <p className="text-xs text-white/30 mt-0.5">
                    {new Date(buyer.next_action_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {buyers.length === 0 && (
        <div className="text-center py-20 surface-subtle rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white/20" />
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
