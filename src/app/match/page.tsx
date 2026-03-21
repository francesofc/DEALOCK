"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Plus, 
  Target,
  UserCircle,
  Building2,
  ArrowRight,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { getMatches, getBuyers, getLeads, getMandates } from "@/lib/data";
import { MatchOpportunity, Buyer, Lead, Mandate, MatchScore } from "@/types/database";

const scoreMap: Record<MatchScore, { label: string; color: string; bg: string }> = {
  weak: { label: "Weak Fit", color: "text-white/40", bg: "bg-white/[0.04]" },
  fair: { label: "Fair", color: "text-amber-400", bg: "bg-amber-500/10" },
  good: { label: "Good", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  excellent: { label: "Excellent", color: "text-violet-400", bg: "bg-violet-500/10" },
};

const priorityMap = {
  low: { label: "Low", className: "bg-white/[0.06] text-white/50" },
  medium: { label: "Medium", className: "bg-amber-500/15 text-amber-400" },
  high: { label: "High", className: "bg-orange-500/15 text-orange-400" },
  urgent: { label: "Urgent", className: "bg-red-500/15 text-red-400" },
};

export default function MatchPage() {
  const [matches, setMatches] = useState<MatchOpportunity[]>([]);
  const [buyers, setBuyers] = useState<Record<string, Buyer>>({});
  const [sellers, setSellers] = useState<Record<string, Lead>>({});
  const [mandates, setMandates] = useState<Record<string, Mandate>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [matchesData, buyersData, sellersData, mandatesData] = await Promise.all([
        getMatches(),
        getBuyers(),
        getLeads(),
        getMandates(),
      ]);
      
      setMatches(matchesData);
      setBuyers(buyersData.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}));
      setSellers(sellersData.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}));
      setMandates(mandatesData.reduce((acc, m) => ({ ...acc, [m.id]: m }), {}));
      setLoading(false);
    }
    loadData();
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
        <p className="text-white/50 text-sm">Loading matches...</p>
      </div>
    );
  }

  // Separate active and archived matches
  const activeMatches = matches.filter(m => m.status !== 'archived');
  const archivedMatches = matches.filter(m => m.status === 'archived');

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Match</h1>
          <p className="text-white/40 mt-1">
            {activeMatches.length} active opportunities
          </p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          Create Match
        </Button>
      </div>

      {/* MATCH CARDS */}
      <div className="space-y-4">
        {activeMatches.map((match) => {
          const buyer = buyers[match.buyer_id];
          const seller = sellers[match.seller_id];
          const mandate = match.mandate_id ? mandates[match.mandate_id] : null;
          const score = scoreMap[match.match_score];
          const priority = priorityMap[match.priority];
          
          if (!buyer || !seller) return null;
          
          return (
            <div 
              key={match.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all"
            >
              {/* Top Row: Buyer ↔ Seller + Score */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Buyer */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-white/50" />
                    </div>
                    <div>
                      <p className="font-medium">{buyer.name}</p>
                      <p className="text-sm text-white/40">
                        {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white/30" />
                  </div>
                  
                  {/* Seller/Property */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white/50" />
                    </div>
                    <div>
                      <p className="font-medium">{seller.neighborhood}</p>
                      <p className="text-sm text-white/40">
                        {formatCurrency(seller.price)} · {seller.property_type}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Score Badge */}
                <div className={`px-3 py-1.5 rounded-lg ${score.bg}`}>
                  <span className={`text-sm font-medium ${score.color}`}>
                    {match.match_score_value}% Match
                  </span>
                </div>
              </div>
              
              {/* Match Reasons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {match.match_reasons.slice(0, 3).map((reason, i) => (
                  <span 
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-white/50"
                  >
                    {reason}
                  </span>
                ))}
              </div>
              
              {/* Bottom Row: Status, Priority, Action */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={priority.className}>
                    {priority.label} Priority
                  </Badge>
                  {mandate?.exclusive && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">
                      Exclusive
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/50">
                    {match.recommended_action}
                  </span>
                  <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90">
                    <Zap className="w-3.5 h-3.5" />
                    Action
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {activeMatches.length === 0 && (
        <div className="text-center py-20 surface-subtle rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-medium mb-2">No matches yet</h3>
          <p className="text-white/40 text-sm mb-6">Match buyers with properties to see opportunities</p>
          <Button className="gap-2 bg-white text-black hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Create First Match
          </Button>
        </div>
      )}

      {/* ARCHIVED MATCHES (if any) */}
      {archivedMatches.length > 0 && (
        <div className="mt-12">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
            Archived ({archivedMatches.length})
          </h3>
          <div className="space-y-2 opacity-60">
            {archivedMatches.map((match) => {
              const buyer = buyers[match.buyer_id];
              const seller = sellers[match.seller_id];
              if (!buyer || !seller) return null;
              
              return (
                <div 
                  key={match.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-white/50">{buyer.name}</span>
                    <ArrowRight className="w-3 h-3 text-white/20" />
                    <span className="text-white/50">{seller.neighborhood}</span>
                  </div>
                  <span className="text-sm text-white/30">{match.match_score_value}% match</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
