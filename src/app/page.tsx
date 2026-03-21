"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Target, 
  FileSignature, 
  TrendingUp, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  Zap,
  ChevronRight,
  ActivityIcon,
  UserCircle,
  Puzzle,
  Wallet,
  CheckCircle
} from "lucide-react";
import { 
  getLeads, 
  getActivities, 
  getMandates, 
  getBuyers, 
  getMatches, 
  getFinanceProfiles 
} from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { 
  Lead, 
  Activity, 
  Mandate, 
  Buyer, 
  MatchOpportunity, 
  FinanceProfile,
  ActivityType 
} from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";

const activityTypeMap: Record<ActivityType, { label: string }> = {
  call: { label: "Call" },
  email: { label: "Email" },
  whatsapp: { label: "WhatsApp" },
  meeting: { label: "Meeting" },
  note: { label: "Note" },
  mandate: { label: "Mandate" },
  lead: { label: "Lead" },
  buyer: { label: "Buyer" },
  match: { label: "Match" },
  finance: { label: "Finance" },
};

export default function CommandCenterPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [matches, setMatches] = useState<MatchOpportunity[]>([]);
  const [financeProfiles, setFinanceProfiles] = useState<FinanceProfile[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [intelligence, setIntelligence] = useState<Record<string, SellerIntelligence>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [leadsData, buyersData, matchesData, financeData, activitiesData, mandatesData] = await Promise.all([
        getLeads(),
        getBuyers(),
        getMatches(),
        getFinanceProfiles(),
        getActivities(),
        getMandates(),
      ]);
      
      setLeads(leadsData);
      setBuyers(buyersData);
      setMatches(matchesData);
      setFinanceProfiles(financeData);
      setActivities(activitiesData.slice(0, 5));
      setMandates(mandatesData);
      
      // Load intelligence for priority sellers
      const priorityLeads = leadsData.filter(l => 
        ['qualified', 'replied', 'call_scheduled', 'mandate_proposed'].includes(l.status)
      ).slice(0, 3);
      
      const intelMap: Record<string, SellerIntelligence> = {};
      for (const lead of priorityLeads) {
        const intel = await getLeadIntelligence(lead.id, lead);
        intelMap[lead.id] = intel;
      }
      setIntelligence(intelMap);
      setLoading(false);
    }
    loadData();
  }, []);

  // ============================================
  // METRICS ACROSS 5 LAYERS
  // ============================================
  
  // Sellers layer
  const urgentSellers = leads.filter(l => 
    ['mandate_proposed', 'mandate_sent'].includes(l.status)
  ).length;
  
  // Buyers layer
  const qualifiedBuyers = buyers.filter(b => 
    b.status === 'qualified' || b.status === 'viewing_scheduled'
  ).length;
  
  // Match layer
  const activeMatches = matches.filter(m => 
    m.status !== 'archived' && m.status !== 'closed'
  ).length;
  
  const highPriorityMatches = matches.filter(m => 
    (m.priority === 'high' || m.priority === 'urgent') && m.status !== 'archived'
  ).length;
  
  // Finance layer
  const financeBlockers = financeProfiles.filter(f => 
    f.status === 'incomplete' || f.status === 'needs_clarification'
  ).length;
  
  const readyBuyers = financeProfiles.filter(f => 
    f.status === 'ready_to_progress' || f.status === 'strong_buyer'
  ).length;
  
  // Mandates layer
  const pendingSignatures = mandates.filter(m => m.status === 'sent').length;
  const activeMandates = mandates.filter(m => m.status === 'signed').length;

  // ============================================
  // PRIORITY ITEMS
  // ============================================
  
  // Priority sellers
  const prioritySellers = leads
    .filter(l => ['qualified', 'replied', 'call_scheduled', 'mandate_proposed'].includes(l.status))
    .sort((a, b) => {
      const aIntel = intelligence[a.id];
      const bIntel = intelligence[b.id];
      const aScore = (aIntel?.mandate_readiness_score || 0) + ((a.priority_score || 0) * 20);
      const bScore = (bIntel?.mandate_readiness_score || 0) + ((b.priority_score || 0) * 20);
      return bScore - aScore;
    })
    .slice(0, 3);

  // High priority matches
  const priorityMatches = matches
    .filter(m => (m.priority === 'high' || m.priority === 'urgent') && m.status !== 'archived')
    .slice(0, 2);

  // Finance blockers
  const blockedFinance = financeProfiles
    .filter(f => f.status === 'incomplete' || f.status === 'needs_clarification')
    .slice(0, 2);

  // Today's focus actions (sellers + matches)
  const todaysActions = prioritySellers
    .filter(l => {
      const intel = intelligence[l.id];
      return intel?.suggested_timing === 'today' || intel?.suggested_timing === 'immediate';
    })
    .slice(0, 2);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading command center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* HERO HEADER */}
      <section className="pb-6 border-b border-white/[0.06]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-white/40 mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-3xl font-semibold tracking-tight">Command Center</h1>
          </div>
          
          {/* Key Metrics - 5 Layer Summary */}
          <div className="flex items-center gap-8">
            <Metric value={urgentSellers} label="Urgent Sellers" />
            <Metric value={qualifiedBuyers} label="Qualified Buyers" />
            <Metric value={activeMatches} label="Active Matches" />
            <Metric value={activeMandates} label="Mandates" />
          </div>
        </div>
      </section>

      {/* TODAY'S FOCUS - Primary Section */}
      {(todaysActions.length > 0 || priorityMatches.length > 0) && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-medium">Today's Focus</h2>
          </div>
          
          <div className="space-y-3">
            {/* Seller Actions */}
            {todaysActions.map((lead) => {
              const intel = intelligence[lead.id];
              return (
                <div 
                  key={lead.id}
                  className="group flex items-center justify-between p-5 surface-elevated rounded-2xl hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => router.push(`/sellers/${lead.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-lg">
                      🏠
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{lead.owner_name}</p>
                        <Badge variant="outline" className="text-xs border-white/10">
                          Seller
                        </Badge>
                      </div>
                      <p className="text-sm text-white/50 mt-0.5">
                        {intel?.next_best_move.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {intel && (
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${intel.mandate_readiness_score}%` }}
                            />
                          </div>
                          <span className="text-sm text-white/60">{intel.mandate_readiness_score}%</span>
                        </div>
                      </div>
                    )}
                    <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {/* Match Actions */}
            {priorityMatches.map((match) => (
              <div 
                key={match.id}
                className="group flex items-center justify-between p-5 surface-elevated rounded-2xl hover:border-white/10 transition-all cursor-pointer"
                onClick={() => router.push('/match')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Puzzle className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium">Match Opportunity</p>
                      <Badge className="text-xs bg-violet-500/20 text-violet-400 border-0">
                        {match.match_score_value}% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-white/50 mt-0.5">
                      {match.recommended_action}
                    </p>
                  </div>
                </div>
                
                <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                  Action
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MAIN GRID - 5 Layer Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          
          {/* PRIORITY SELLERS */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-medium">Priority Sellers</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/50 hover:text-white gap-1"
                onClick={() => router.push('/sellers')}
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {prioritySellers.map((lead) => {
                const intel = intelligence[lead.id];
                return (
                  <div 
                    key={lead.id}
                    className="p-4 surface-subtle rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    onClick={() => router.push(`/sellers/${lead.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{lead.owner_name}</p>
                        <p className="text-sm text-white/40 mt-0.5">{lead.property_type} · {lead.city}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                    
                    {intel && (
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${intel.mandate_readiness_score}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/40">{intel.mandate_readiness_score}% ready</span>
                        </div>
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-xs text-white/50">{intel.next_best_move.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {prioritySellers.length === 0 && (
                <div className="p-8 text-center text-white/30 surface-subtle rounded-xl">
                  <Target className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No priority sellers</p>
                </div>
              )}
            </div>
          </section>

          {/* STRONG BUYERS */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-medium">Strong Buyers</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/50 hover:text-white gap-1"
                onClick={() => router.push('/buyers')}
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {buyers
                .filter(b => b.seriousness === 'high' || b.seriousness === 'very_high')
                .slice(0, 3)
                .map((buyer) => (
                  <div 
                    key={buyer.id}
                    className="p-4 surface-subtle rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    onClick={() => router.push('/buyers')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-white/50" />
                        </div>
                        <div>
                          <p className="font-medium">{buyer.name}</p>
                          <p className="text-sm text-white/40">
                            {buyer.target_areas[0]} · Budget: €{(buyer.budget_max / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* STRATEGIC SIGNALS */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-medium">Strategic Signals</h2>
            </div>
            
            <div className="space-y-3">
              {/* Signal 1: Match Opportunities */}
              {highPriorityMatches > 0 && (
                <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-violet-400/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/[0.08] flex items-center justify-center shrink-0">
                      <Puzzle className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">High-value matches waiting</p>
                      <p className="text-sm text-white/50 mt-1">
                        {highPriorityMatches} urgent match opportunities require action
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signal 2: Finance Blockers */}
              {financeBlockers > 0 && (
                <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-amber-400/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/[0.08] flex items-center justify-center shrink-0">
                      <Wallet className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">Finance documentation needed</p>
                      <p className="text-sm text-white/50 mt-1">
                        {financeBlockers} buyers have incomplete financial profiles
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signal 3: Mandate Opportunities */}
              {pendingSignatures > 0 && (
                <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-emerald-400/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/[0.08] flex items-center justify-center shrink-0">
                      <FileSignature className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">Mandates pending signature</p>
                      <p className="text-sm text-white/50 mt-1">
                        {pendingSignatures} mandates awaiting buyer signature
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signal 4: Ready Buyers */}
              {readyBuyers > 0 && (
                <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-blue-400/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/[0.08] flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">Finance-ready buyers</p>
                      <p className="text-sm text-white/50 mt-1">
                        {readyBuyers} buyers cleared to proceed with offers
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* FINANCE BLOCKERS */}
          {blockedFinance.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <h2 className="text-lg font-medium">Finance Blockers</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/50 hover:text-white gap-1"
                  onClick={() => router.push('/finance')}
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {blockedFinance.map((profile) => {
                  const buyer = buyers.find(b => b.id === profile.buyer_id);
                  if (!buyer) return null;
                  
                  return (
                    <div 
                      key={profile.id}
                      className="p-4 surface-subtle rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      onClick={() => router.push('/finance')}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{buyer.name}</p>
                          <p className="text-sm text-amber-400/70 mt-0.5">
                            {profile.missing_documents.length} documents missing
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <section className="pt-6 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <ActivityIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-medium">Recent Activity</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/50 hover:text-white gap-1"
            onClick={() => router.push('/activities')}
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="text-white/70">{activityTypeMap[activity.type].label}</span>
                  <span className="text-white/30 mx-2">·</span>
                  <span className="text-white/50">{activity.content}</span>
                </p>
              </div>
              <span className="text-xs text-white/30">
                {new Date(activity.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Helper Components

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-right">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
    </div>
  );
}
