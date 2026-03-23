"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EditDrawer } from "@/components/ui/EditDrawer";
import { MatchCreatePanel } from "@/components/matches/MatchCreatePanel";
import { 
  Plus, 
  Target,
  UserCircle,
  Building2,
  ArrowRight,
  Zap,
  MapPin,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Sparkles,
  Search,
  UserPlus,
  Home,
  SlidersHorizontal,
  Cpu,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Filter
} from "lucide-react";
import { getMatches, getBuyers, getLeads, getMandates, getFinanceProfileByBuyer, createMatch } from "@/lib/data";
import { getMatchNextAction, urgencyColor, UrgencyLevel } from "@/lib/intelligence/next-actions";
import { runMatchGeneration, MatchGenerationResult } from "@/lib/intelligence/match-service";
import { MatchOpportunity, Buyer, Lead, Mandate, MatchScore, FinanceProfile } from "@/types/database";

// ============================================
// MATCH SCORING LOGIC
// ============================================

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
// DEFENSIVE MATCH FACTOR ANALYSIS
// ============================================

interface MatchFactor {
  name: string;
  status: 'aligned' | 'partial' | 'gap';
  detail: string;
}

function analyzeMatchFactors(
  buyer: Buyer | undefined, 
  seller: Lead | undefined, 
  finance: FinanceProfile | null | undefined
): MatchFactor[] {
  // Defensive: return empty if missing core data
  if (!buyer || !seller) {
    return [];
  }
  
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
    detail: finance?.status?.replace('_', ' ') || "Unknown"
  });
  
  return factors;
}

// ============================================
// MATCH CARD COMPONENT
// ============================================

interface MatchCardProps {
  match: MatchOpportunity;
  buyers: Record<string, Buyer>;
  sellers: Record<string, Lead>;
  mandates: Record<string, Mandate>;
  financeMap: Record<string, FinanceProfile | null | undefined>;
}

function MatchCard({ match, buyers, sellers, mandates, financeMap }: MatchCardProps) {
  const buyer = buyers[match.buyer_id];
  
  // Support both new schema (target_type/target_id) and legacy (seller_id/mandate_id)
  let seller = null;
  let mandate = null;
  
  if (match.target_type === 'seller') {
    seller = sellers[match.target_id];
  } else if (match.target_type === 'mandate') {
    mandate = mandates[match.target_id];
    // Try to get seller from mandate's lead_id
    if (mandate) {
      seller = sellers[mandate.lead_id];
    }
  } else {
    // Legacy fallback
    seller = match.seller_id ? sellers[match.seller_id] : null;
    mandate = match.mandate_id ? mandates[match.mandate_id] : null;
  }
  
  const finance = financeMap[match.buyer_id];
  
  // Defensive: Don't render if core data is missing
  if (!buyer || !seller) {
    return null;
  }
  
  // Get next action intelligence
  const nextAction = getMatchNextAction(match, finance || null);
  
  const factors = analyzeMatchFactors(buyer, seller, finance);
  const score = scoreMap[match.match_score];
  const priority = priorityMap[match.priority];
  const alignedCount = factors.filter(f => f.status === 'aligned').length;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
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
            {match.score_value}%
          </div>
          <p className={`text-xs ${score.color} opacity-70`}>{score.label} Fit</p>
        </div>
      </div>
      
      {/* FACTOR BREAKDOWN */}
      {factors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {factors.map((factor) => (
            <FactorBadge key={factor.name} factor={factor} />
          ))}
        </div>
      )}
      
      {/* ALIGNMENT SUMMARY */}
      {factors.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-white/60">
            {alignedCount} of {factors.length} factors aligned
          </span>
          <span className="text-white/30">·</span>
          <span className="text-white/40">{score.description}</span>
        </div>
      )}
      
      {/* NEXT ACTION INTELLIGENCE */}
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
      
      {/* ACTION BAR */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={priority.className}>
            {priority.label}
          </Badge>
          {finance?.status && finance.status !== 'ready_to_progress' && finance.status !== 'strong_buyer' && (
            <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[10px]">
              Finance: {finance.status.replace(/_/g, ' ')}
            </Badge>
          )}
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
          <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90">
            <Zap className="w-3.5 h-3.5" />
            {match.status === 'identified' ? 'Contact Buyer' : 'Follow Up'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FactorBadge({ factor }: { factor: MatchFactor }) {
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
}

// ============================================
// MAIN PAGE
// ============================================

export default function MatchPage() {
  const [matches, setMatches] = useState<MatchOpportunity[]>([]);
  const [buyers, setBuyers] = useState<Record<string, Buyer>>({});
  const [sellers, setSellers] = useState<Record<string, Lead>>({});
  const [mandates, setMandates] = useState<Record<string, Mandate>>({});
  const [financeMap, setFinanceMap] = useState<Record<string, FinanceProfile | null | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create Match Drawer State
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [newMatchData, setNewMatchData] = useState<Partial<MatchOpportunity>>({});
  const [isCreating, setIsCreating] = useState(false);
  
  // Auto Match Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<MatchGenerationResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
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
        
        // Load finance profiles for buyers in parallel
        const financeProfileResults = await Promise.all(
          buyersData.map(async (buyer) => {
            const profile = await getFinanceProfileByBuyer(buyer.id);
            return [buyer.id, profile] as [string, FinanceProfile | null];
          })
        );
        const financeProfiles: Record<string, FinanceProfile | null> = {};
        for (const [buyerId, profile] of financeProfileResults) {
          financeProfiles[buyerId] = profile;
        }
        setFinanceMap(financeProfiles);
      } catch (err) {
        setError("Failed to load match data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]" data-testid="loading-spinner">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading match opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
        <p className="text-white/40 text-sm mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-white text-black hover:bg-white/90">
          Retry
        </Button>
      </div>
    );
  }

  // Filter valid matches (those with existing buyer and valid target)
  const validMatches = matches.filter(m => {
    const buyer = buyers[m.buyer_id];
    if (!buyer) return false;
    
    // Support new schema (target_type/target_id) and legacy (seller_id)
    if (m.target_type === 'seller') {
      return !!sellers[m.target_id];
    } else if (m.target_type === 'mandate') {
      const mandate = mandates[m.target_id];
      return mandate && !!sellers[mandate.lead_id];
    } else {
      // Legacy fallback
      return !!sellers[m.seller_id || ''];
    }
  });
  
  // Categorize matches by score
  const excellentMatches = validMatches.filter(m => m.match_score === 'excellent' && m.status !== 'archived');
  const goodMatches = validMatches.filter(m => m.match_score === 'good' && m.status !== 'archived');
  const fairMatches = validMatches.filter(m => m.match_score === 'fair' && m.status !== 'archived');
  const weakMatches = validMatches.filter(m => m.match_score === 'weak' || m.status === 'archived');
  const urgentMatches = validMatches.filter(m => m.priority === 'urgent' && m.status !== 'archived');

  const hasAnyMatches = excellentMatches.length > 0 || goodMatches.length > 0 || fairMatches.length > 0;

  return (
    <div className="max-w-6xl mx-auto" data-testid="match-page" data-page-ready="true">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold tracking-tight">Match Intelligence</h1>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Auto</span>
            </div>
          </div>
          <p className="text-white/40 mt-1">
            {validMatches.length > 0 
              ? `${excellentMatches.length + goodMatches.length} high-value opportunities identified`
              : "AI-powered opportunity detection and prioritization"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Generate Matches Button - Primary Action */}
          <Button 
            className="gap-2 bg-white text-black hover:bg-white/90"
            data-testid="generate-matches-button"
            onClick={async () => {
              setIsGenerating(true);
              setShowResult(false);
              try {
                const result = await runMatchGeneration();
                setGenerationResult(result);
                setShowResult(true);
                // Refresh matches
                const matchesData = await getMatches();
                setMatches(matchesData);
              } catch (err) {
                console.error('Match generation failed:', err);
              } finally {
                setIsGenerating(false);
              }
            }}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Matches'}
          </Button>
          
          {/* Manual Match - Secondary/Override */}
          <Button 
            variant="outline"
            className="gap-2 border-white/10 hover:bg-white/[0.04]"
            data-testid="manual-match-button"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Manual
          </Button>
        </div>
      </div>

      {/* GENERATION RESULT SUMMARY */}
      {showResult && generationResult && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20" data-testid="generation-summary">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-emerald-300">Generation Complete</span>
            </div>
            <button 
              onClick={() => setShowResult(false)}
              className="text-white/40 hover:text-white/60"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <p className="text-2xl font-semibold text-emerald-400">{generationResult.created}</p>
              <p className="text-white/50">New matches</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <p className="text-2xl font-semibold text-blue-400">{generationResult.analyzed}</p>
              <p className="text-white/50">Analyzed</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <p className="text-2xl font-semibold text-amber-400">{generationResult.skipped}</p>
              <p className="text-white/50">Duplicates skipped</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <p className="text-2xl font-semibold text-white/40">{generationResult.blocked}</p>
              <p className="text-white/50">Below threshold</p>
            </div>
          </div>
          {(generationResult.details.mandates > 0 || generationResult.details.sellers > 0) && (
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-4 text-xs text-white/40">
              {generationResult.details.mandates > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                  {generationResult.details.mandates} mandate matches
                </span>
              )}
              {generationResult.details.sellers > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  {generationResult.details.sellers} seller matches
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {hasAnyMatches ? (
        <>
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
              <SectionHeader 
                icon={Sparkles} 
                iconColor="violet"
                title="Excellent Fits" 
                subtitle="All factors aligned - prioritize these opportunities"
              />
              <div className="space-y-3">
                {excellentMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    buyers={buyers}
                    sellers={sellers}
                    mandates={mandates}
                    financeMap={financeMap}
                  />
                ))}
              </div>
            </section>
          )}

          {/* GOOD MATCHES */}
          {goodMatches.length > 0 && (
            <section className="mb-8">
              <SectionHeader 
                icon={TrendingUp} 
                iconColor="emerald"
                title="Strong Fits" 
                subtitle="Most factors aligned - minor negotiation needed"
              />
              <div className="space-y-3">
                {goodMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    buyers={buyers}
                    sellers={sellers}
                    mandates={mandates}
                    financeMap={financeMap}
                  />
                ))}
              </div>
            </section>
          )}

          {/* FAIR MATCHES */}
          {fairMatches.length > 0 && (
            <section className="mb-8">
              <SectionHeader 
                icon={Target} 
                iconColor="amber"
                title="Workable Fits" 
                subtitle="Some alignment - price or terms negotiation likely"
              />
              <div className="space-y-3">
                {fairMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    buyers={buyers}
                    sellers={sellers}
                    mandates={mandates}
                    financeMap={financeMap}
                  />
                ))}
              </div>
            </section>
          )}

          {/* WEAK/ARCHIVED */}
          {weakMatches.length > 0 && (
            <section className="opacity-60">
              <SectionHeader 
                icon={Clock} 
                iconColor="default"
                title="Weak / Archived" 
                subtitle="Keep in pipeline for other properties"
                dim
              />
              <div className="space-y-2">
                {weakMatches.slice(0, 3).map(match => {
                  const buyer = buyers[match.buyer_id];
                  if (!buyer) return null;
                  
                  // Support new schema and legacy
                  let seller = null;
                  if (match.target_type === 'seller') {
                    seller = sellers[match.target_id];
                  } else if (match.target_type === 'mandate') {
                    const mandate = mandates[match.target_id];
                    seller = mandate ? sellers[mandate.lead_id] : null;
                  } else {
                    seller = match.seller_id ? sellers[match.seller_id] : null;
                  }
                  if (!seller) return null;
                  return (
                    <div key={match.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-white/50">{buyer.name}</span>
                      <ArrowRight className="w-3 h-3 text-white/20" />
                      <span className="text-white/50">{seller.neighborhood}</span>
                      <span className="ml-auto text-sm text-white/30">{match.score_value}%</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      ) : (
        /* PREMIUM EMPTY STATE */
        <div className="space-y-8">
          {/* Empty State Hero */}
          <div className="text-center py-16 surface-subtle rounded-2xl border border-white/[0.04]">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-medium mb-2">No matches yet</h3>
            <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
              Run the match engine to automatically identify opportunities between your buyers 
              and properties. The engine analyzes budget, location, timeline, and readiness.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button 
                className="gap-2 bg-white text-black hover:bg-white/90"
                onClick={async () => {
                  setIsGenerating(true);
                  setShowResult(false);
                  try {
                    const result = await runMatchGeneration();
                    setGenerationResult(result);
                    setShowResult(true);
                    const matchesData = await getMatches();
                    setMatches(matchesData);
                  } catch (err) {
                    console.error('Match generation failed:', err);
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Matches'}
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 border-white/10 hover:bg-white/[0.04]"
                onClick={() => setIsCreateDrawerOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Manual Match
              </Button>
            </div>
          </div>

          {/* How It Works */}
          <div className="grid grid-cols-3 gap-6">
            <FeatureCard 
              icon={UserPlus}
              title="Add Buyers"
              description="Register qualified buyers with their search criteria and budget"
            />
            <FeatureCard 
              icon={Home}
              title="List Properties"
              description="Add seller properties with location, type, and pricing"
            />
            <FeatureCard 
              icon={Sparkles}
              title="Get Matches"
              description="Our engine finds optimal buyer-property combinations"
            />
          </div>
        </div>
      )}

      {/* MANUAL MATCH DRAWER - Secondary/Override Action */}
      <EditDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => {
          setIsCreateDrawerOpen(false);
          setNewMatchData({});
        }}
        title="Add Manual Match"
        subtitle="Override for special cases — automatic matching is primary"
        onSave={async () => {
          // Validate required fields
          if (!newMatchData.buyer_id || !newMatchData.target_type || !newMatchData.target_id) {
            console.error('Missing required fields:', { 
              buyer_id: newMatchData.buyer_id, 
              target_type: newMatchData.target_type, 
              target_id: newMatchData.target_id 
            });
            return;
          }
          setIsCreating(true);
          try {
            const match: MatchOpportunity = {
              id: crypto.randomUUID(),
              buyer_id: newMatchData.buyer_id,
              target_type: newMatchData.target_type,
              target_id: newMatchData.target_id,
              match_score: newMatchData.match_score || 'good',
              score_value: newMatchData.score_value || 75,
              match_reasons: newMatchData.match_reasons || [],
              blockers: newMatchData.blockers || [],
              recommended_action: newMatchData.recommended_action || '',
              status: 'identified',
              priority: newMatchData.priority || 'medium',
              notes: newMatchData.notes || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            await createMatch(match);
            // Refresh matches
            const matchesData = await getMatches();
            setMatches(matchesData);
            setIsCreateDrawerOpen(false);
            setNewMatchData({});
          } catch (err) {
            console.error('Failed to create match:', err);
          } finally {
            setIsCreating(false);
          }
        }}
        isSaving={isCreating}
        saveLabel="Create Match"
        disabled={!newMatchData.buyer_id || !newMatchData.target_type || !newMatchData.target_id}
      >
        <MatchCreatePanel onChange={setNewMatchData} />
      </EditDrawer>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

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

function SectionHeader({ 
  icon: Icon, 
  iconColor,
  title, 
  subtitle,
  dim = false
}: { 
  icon: React.ElementType; 
  iconColor: 'violet' | 'emerald' | 'amber' | 'default';
  title: string; 
  subtitle: string;
  dim?: boolean;
}) {
  const colors = {
    violet: "bg-violet-500/10 text-violet-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    default: "bg-white/[0.04] text-white/40",
  };
  
  return (
    <div className={`flex items-center gap-3 mb-4 ${dim ? 'opacity-60' : ''}`}>
      <div className={`w-8 h-8 rounded-lg ${colors[iconColor]} flex items-center justify-center`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-white/40">{subtitle}</p>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
      <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-white/40" />
      </div>
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-white/40">{description}</p>
    </div>
  );
}
