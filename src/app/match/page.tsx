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
  MapPin,
  Wallet,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  Sparkles
} from "lucide-react";
import { getMatches, getBuyers, getLeads, getMandates, getFinanceProfileByBuyer } from "@/lib/data";
import { MatchOpportunity, Buyer, Lead, Mandate, MatchScore, FinanceProfile } from "@/types/database";

// ============================================
// MATCH SCORING LOGIC
// ============================================
// Transparent scoring breakdown visible to users

const scoreMap: Record<MatchScore, { 
  label: string; 
  color: string; 
  bg: string;
  border: string;
  description: string;
}> = {
  excellent: { 
    label: "Excellent", 
    color: "text-violet-400", 
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    description: "All factors aligned - high conversion probability"
  },
  good: { 
    label: "Strong", 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    description: "Most factors aligned - minor negotiation needed"
  },
  fair: { 
    label: "Workable", 
    color: "text-amber-400", 
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    description: "Some alignment - price or terms negotiation likely"
  },
  weak: { 
    label: "Weak", 
    color: "text-white/40", 
    bg: "bg-white/[0.04]",
    border: "border-white/[0.08]",
    description: "Significant gaps - keep in pipeline for other properties"
  },
};

const priorityMap = {
  low: { label: "Low", className: "bg-white/[0.06] text-white/50" },
  medium: { label: "Medium", className: "bg-amber-500/15 text-amber-400" },
  high: { label: "High", className: "bg-orange-500/15 text-orange-400" },
  urgent: { label: "Urgent", className: "bg-red-500/15 text-red-400" },
};

// ============================================
// MATCH FACTOR ANALYSIS
// ============================================

interface MatchFactor {
  name: string;
  status: 'aligned' | 'partial' | 'gap';
  detail: string;
}

function analyzeMatchFactors(
  buyer: Buyer, 
  seller: Lead, 
  finance: FinanceProfile | null
): MatchFactor[] {
  const factors: MatchFactor[] = [];
  
  // Budget fit
  const priceRatio = seller.price / buyer.budget_max;
  if (priceRatio <= 1.0) {
    factors.push({ name: "Budget", status: "aligned", detail: "Within budget" });
  } else if (priceRatio <= 1.15) {
    factors.push({ name: "Budget", status: "partial", detail: "Slightly over budget" });
  } else {
    factors.push({ name: "Budget", status: "gap", detail: "Above budget range" });
  }
  
  // Location fit
  const locationMatch = buyer.target_areas.some(area => 
    seller.neighborhood.toLowerCase().includes(area.toLowerCase()) ||
    area.toLowerCase().includes(seller.neighborhood.toLowerCase())
  );
  factors.push({ 
    name: "Location", 
    status: locationMatch ? "aligned" : "partial", 
    detail: locationMatch ? "Target area match" : "Nearby area"
  });
  
  // Property type fit
  const typeMatch = buyer.property_types.some(type => 
    seller.property_type.toLowerCase().includes(type.toLowerCase())
  );
  factors.push({ 
    name: "Type", 
    status: typeMatch ? "aligned" : "partial", 
    detail: typeMatch ? "Preferred type" : "Alternative type"
  });
  
  // Timeline fit
  const timelineStatus = buyer.timeline === 'immediate' ? 'aligned' : 
                        buyer.timeline === '1_month' ? 'partial' : 'gap';
  factors.push({ 
    name: "Timeline", 
    status: timelineStatus, 
    detail: buyer.timeline.replace('_', ' ')
  });
  
  // Readiness fit
  const readinessStatus = finance?.status === 'strong_buyer' ? 'aligned' :
                         finance?.status === 'ready_to_progress' ? 'partial' : 'gap';
  factors.push({ 
    name: "Readiness", 
    status: readinessStatus, 
    detail: finance?.status.replace('_', ' ') || "Unknown"
  });
  
  return factors;
}

export default function MatchPage() {
  const [matches, setMatches] = useState<MatchOpportunity[]>([]);
  const [buyers, setBuyers] = useState<Record<string, Buyer>>({});
  const [sellers, setSellers] = useState<Record<string, Lead>>({});
  const [mandates, setMandates] = useState<Record<string, Mandate>>({});
  const [financeMap, setFinanceMap] = useState<Record<string, FinanceProfile | null>>({});
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
      
      // Load finance profiles for buyers
      const financeProfiles: Record<string, FinanceProfile | null> = {};
      for (const buyer of buyersData) {
        financeProfiles[buyer.id] = await getFinanceProfileByBuyer(buyer.id);
      }
      setFinanceMap(financeProfiles);
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
        <p className="text-white/50 text-sm">Loading match opportunities...</p>
      </div>
    );
  }

  // Categorize matches by score
  const excellentMatches = matches.filter(m => m.match_score === 'excellent' && m.status !== 'archived');
  const goodMatches = matches.filter(m => m.match_score === 'good' && m.status !== 'archived');
  const fairMatches = matches.filter(m => m.match_score === 'fair' && m.status !== 'archived');
  const weakMatches = matches.filter(m => m.match_score === 'weak' || m.status === 'archived');
  
  const urgentMatches = matches.filter(m => m.priority === 'urgent' && m.status !== 'archived');

  // Render a match card with full factor breakdown
  const MatchCard = ({ match, showFactors = false }: { match: MatchOpportunity; showFactors?: boolean }) => {
    const buyer = buyers[match.buyer_id];
    const seller = sellers[match.seller_id];
    const mandate = match.mandate_id ? mandates[match.mandate_id] : null;
    const finance = financeMap[match.buyer_id];
    const score = scoreMap[match.match_score];
    const priority = priorityMap[match.priority];
    const factors = analyzeMatchFactors(buyer, seller, finance);
    
    if (!buyer || !seller) return null;
    
    const alignedCount = factors.filter(f => f.status === 'aligned').length;
    
    return (
      <div 
        className={`p-5 rounded-2xl border transition-all ${score.bg} ${score.border} hover:brightness-110`}
      >
        {/* HEADER: Buyer ↔ Property + Score */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Buyer Avatar + Info */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/[0.08] flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="font-medium">{buyer.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Wallet className="w-3 h-3 text-white/30" />
                  <span className="text-sm text-white/50">
                    {formatCurrency(buyer.budget_max)} max
                  </span>
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white/30" />
            </div>
            
            {/* Property */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/[0.08] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="font-medium">{seller.neighborhood}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3 h-3 text-white/30" />
                  <span className="text-sm text-white/50">
                    {formatCurrency(seller.price)} · {seller.property_type}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Score */}
          <div className="text-right">
            <div className={`text-2xl font-semibold ${score.color}`}>
              {match.match_score_value}%
            </div>
            <p className={`text-xs ${score.color} opacity-70`}>{score.label} Fit</p>
          </div>
        </div>
        
        {/* FACTOR BREAKDOWN */}
        <div className="flex flex-wrap gap-2 mb-4">
          {factors.map((factor) => (
            <FactorBadge key={factor.name} factor={factor} />
          ))}
        </div>
        
        {/* ALIGNMENT SUMMARY */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-white/60">
            {alignedCount} of {factors.length} factors aligned
          </span>
          <span className="text-white/30">·</span>
          <span className="text-white/40">{score.description}</span>
        </div>
        
        {/* ACTION BAR */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={priority.className}>
              {priority.label}
            </Badge>
            {mandate?.exclusive && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">
                Exclusive Mandate
              </Badge>
            )}
            {buyer.pre_approved && (
              <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px]">
                Pre-approved
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50">{match.recommended_action}</span>
            <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90">
              <Zap className="w-3.5 h-3.5" />
              Action
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const FactorBadge = ({ factor }: { factor: MatchFactor }) => {
    const colors = {
      aligned: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      partial: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      gap: "bg-white/[0.06] text-white/40 border-white/[0.08]",
    };
    
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${colors[factor.status]}`}>
        <span className="font-medium">{factor.name}</span>
        <span className="opacity-60">·</span>
        <span className="opacity-80">{factor.detail}</span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Match</h1>
          <p className="text-white/40 mt-1">
            Strategic opportunity engine · {excellentMatches.length + goodMatches.length} high-value matches
          </p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          Create Match
        </Button>
      </div>

      {/* SUMMARY STRIP */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SummaryCard 
          icon={Sparkles} 
          value={excellentMatches.length} 
          label="Excellent Fits" 
          color="violet"
        />
        <SummaryCard 
          icon={TrendingUp} 
          value={goodMatches.length} 
          label="Strong Fits" 
          color="emerald"
        />
        <SummaryCard 
          icon={AlertTriangle} 
          value={fairMatches.length} 
          label="Workable Fits" 
          color="amber"
        />
        <SummaryCard 
          icon={Zap} 
          value={urgentMatches.length} 
          label="Urgent Actions" 
          color="red"
        />
      </div>

      {/* EXCELLENT MATCHES */}
      {excellentMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="font-medium">Excellent Fits</h2>
              <p className="text-sm text-white/40">All factors aligned - prioritize these</p>
            </div>
          </div>
          <div className="space-y-3">
            {excellentMatches.map(match => <MatchCard key={match.id} match={match} />)}
          </div>
        </section>
      )}

      {/* GOOD MATCHES */}
      {goodMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-medium">Strong Fits</h2>
              <p className="text-sm text-white/40">Most factors aligned - minor negotiation</p>
            </div>
          </div>
          <div className="space-y-3">
            {goodMatches.map(match => <MatchCard key={match.id} match={match} />)}
          </div>
        </section>
      )}

      {/* FAIR MATCHES */}
      {fairMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="font-medium">Workable Fits</h2>
              <p className="text-sm text-white/40">Some alignment - price/terms negotiation likely</p>
            </div>
          </div>
          <div className="space-y-3">
            {fairMatches.map(match => <MatchCard key={match.id} match={match} />)}
          </div>
        </section>
      )}

      {/* WEAK/ARCHIVED */}
      {weakMatches.length > 0 && (
        <section className="opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <Clock className="w-4 h-4 text-white/40" />
            </div>
            <div>
              <h2 className="font-medium text-white/60">Weak / Archived</h2>
              <p className="text-sm text-white/30">Keep in pipeline for other properties</p>
            </div>
          </div>
          <div className="space-y-2">
            {weakMatches.slice(0, 3).map(match => {
              const buyer = buyers[match.buyer_id];
              const seller = sellers[match.seller_id];
              if (!buyer || !seller) return null;
              return (
                <div key={match.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-white/40">{buyer.name}</span>
                  <ArrowRight className="w-3 h-3 text-white/20" />
                  <span className="text-white/40">{seller.neighborhood}</span>
                  <span className="ml-auto text-sm text-white/30">{match.match_score_value}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {matches.filter(m => m.status !== 'archived').length === 0 && (
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
  color: 'violet' | 'emerald' | 'amber' | 'red';
}) {
  const colors = {
    violet: "bg-violet-500/10 text-violet-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    red: "bg-red-500/10 text-red-400",
  };
  
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-white/40">{label}</p>
    </div>
  );
}
