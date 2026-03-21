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
  CheckCircle2,
  Flame,
  AlertTriangle,
  Building2,
  MapPin
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

// ============================================
// DECISION HIERARCHY
// ============================================
// Urgent Now → Important Today → Strategic Opportunities

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
      ).slice(0, 5);
      
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
  // DECISION HIERARCHY CALCULATIONS
  // ============================================

  // URGENT NOW: Actions requiring immediate attention
  const urgentNow = [
    // Mandates in closing stage
    ...leads
      .filter(l => ['mandate_proposed', 'mandate_sent'].includes(l.status))
      .filter(l => {
        const intel = intelligence[l.id];
        return intel && intel.mandate_readiness_score > 60;
      })
      .map(l => ({ type: 'seller' as const, item: l, intel: intelligence[l.id] })),
    
    // Urgent matches
    ...matches
      .filter(m => m.priority === 'urgent' && m.status !== 'archived')
      .slice(0, 2)
      .map(m => ({ type: 'match' as const, item: m })),
  ].slice(0, 4);

  // IMPORTANT TODAY: Should act on today
  const importantToday = [
    // High-readiness sellers not yet urgent
    ...leads
      .filter(l => ['replied', 'call_scheduled'].includes(l.status))
      .filter(l => {
        const intel = intelligence[l.id];
        return intel && intel.mandate_readiness_score > 50;
      })
      .filter(l => !urgentNow.find(u => u.type === 'seller' && u.item.id === l.id))
      .slice(0, 3)
      .map(l => ({ type: 'seller' as const, item: l, intel: intelligence[l.id] })),
  ];

  // STRATEGIC OPPORTUNITIES: High value, not time-critical
  const strategicOpportunities = [
    // Excellent matches
    ...matches
      .filter(m => m.match_score === 'excellent' && m.status !== 'archived')
      .filter(m => m.priority !== 'urgent')
      .slice(0, 2)
      .map(m => ({ type: 'match' as const, item: m })),
  ];

  // BLOCKERS: Things preventing progress
  const blockers = [
    // Finance blockers
    ...financeProfiles
      .filter(f => f.status === 'incomplete' || f.status === 'needs_clarification')
      .slice(0, 2)
      .map(f => ({ type: 'finance' as const, item: f })),
  ];

  // READY RESOURCES: Buyers/matches ready to go
  const readyResources = [
    // Finance-ready buyers
    ...buyers
      .filter(b => {
        const f = financeProfiles.find(fp => fp.buyer_id === b.id);
        return f && (f.status === 'ready_to_progress' || f.status === 'strong_buyer');
      })
      .slice(0, 2)
      .map(b => ({ type: 'buyer' as const, item: b })),
  ];

  // Summary metrics
  const metrics = {
    urgentActions: leads.filter(l => ['mandate_proposed', 'mandate_sent'].includes(l.status)).length +
                   matches.filter(m => m.priority === 'urgent').length,
    activeMatches: matches.filter(m => m.status !== 'archived').length,
    readyBuyers: financeProfiles.filter(f => f.status === 'ready_to_progress' || f.status === 'strong_buyer').length,
    pendingMandates: mandates.filter(m => m.status === 'sent').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading command center...</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* HEADER */}
      <section className="pb-6 border-b border-white/[0.06]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-white/40 mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-3xl font-semibold tracking-tight">Command Center</h1>
          </div>
          
          {/* Quick Metrics */}
          <div className="flex items-center gap-8">
            <Metric value={metrics.urgentActions} label="Urgent" color="red" />
            <Metric value={metrics.activeMatches} label="Active Matches" />
            <Metric value={metrics.readyBuyers} label="Ready Buyers" color="emerald" />
            <Metric value={metrics.pendingMandates} label="Pending Signatures" />
          </div>
        </div>
      </section>

      {/* ============================================
          PRIORITY 1: URGENT NOW
          ============================================ */}
      {urgentNow.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium">Urgent Now</h2>
              <p className="text-sm text-white/40">Requires immediate action</p>
            </div>
            <Badge className="ml-2 bg-red-500/20 text-red-400 border-0">
              {urgentNow.length} items
            </Badge>
          </div>
          
          <div className="space-y-3">
            {urgentNow.map((action, i) => {
              if (action.type === 'seller') {
                const lead = action.item as Lead;
                const intel = action.intel;
                return (
                  <ActionCard
                    key={lead.id}
                    icon={Building2}
                    iconColor="orange"
                    title={lead.owner_name}
                    subtitle={`${lead.property_type} · ${lead.city}`}
                    action={intel?.next_best_move.replace(/_/g, ' ') || 'Review opportunity'}
                    urgency="closing"
                    readiness={intel?.mandate_readiness_score}
                    onClick={() => router.push(`/sellers/${lead.id}`)}
                  />
                );
              }
              if (action.type === 'match') {
                const match = action.item as MatchOpportunity;
                return (
                  <ActionCard
                    key={match.id}
                    icon={Puzzle}
                    iconColor="violet"
                    title={`Match Opportunity · ${match.match_score_value}% Fit`}
                    subtitle={match.recommended_action}
                    action="Contact buyer now"
                    urgency="high"
                    onClick={() => router.push('/match')}
                  />
                );
              }
              return null;
            })}
          </div>
        </section>
      )}

      {/* ============================================
          PRIORITY 2: IMPORTANT TODAY
          ============================================ */}
      {importantToday.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium">Important Today</h2>
              <p className="text-sm text-white/40">Schedule time for these today</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {importantToday.map((action) => {
              const lead = action.item as Lead;
              const intel = action.intel;
              return (
                <div
                  key={lead.id}
                  className="p-4 surface-subtle rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                  onClick={() => router.push(`/sellers/${lead.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white/50" />
                      </div>
                      <div>
                        <p className="font-medium">{lead.owner_name}</p>
                        <p className="text-sm text-white/40">{lead.city}</p>
                      </div>
                    </div>
                    {intel && (
                      <div className="text-right">
                        <span className="text-sm font-medium text-emerald-400">
                          {intel.mandate_readiness_score}%
                        </span>
                        <p className="text-xs text-white/40">ready</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <p className="text-sm text-white/60">
                      {intel?.next_best_move.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================
          TWO COLUMN: BLOCKERS + OPPORTUNITIES
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BLOCKERS */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <h2 className="text-lg font-medium">Blockers</h2>
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
            {blockers.length > 0 ? blockers.map((blocker) => {
              const profile = blocker.item as FinanceProfile;
              const buyer = buyers.find(b => b.id === profile.buyer_id);
              if (!buyer) return null;
              
              return (
                <div
                  key={profile.id}
                  className="p-4 surface-elevated rounded-xl border-l-2 border-l-red-400/50"
                  onClick={() => router.push('/finance')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium">{buyer.name}</p>
                        <p className="text-sm text-red-400/70">
                          {profile.missing_documents.length} documents missing
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center surface-subtle rounded-xl">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-emerald-400/50" />
                <p className="text-sm text-white/40">No blockers - pipeline flowing</p>
              </div>
            )}
          </div>
        </section>

        {/* STRATEGIC OPPORTUNITIES */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="text-lg font-medium">Strategic Opportunities</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/50 hover:text-white gap-1"
              onClick={() => router.push('/match')}
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {strategicOpportunities.length > 0 ? strategicOpportunities.map((opp) => {
              const match = opp.item as MatchOpportunity;
              return (
                <div
                  key={match.id}
                  className="p-4 surface-elevated rounded-xl border-l-2 border-l-violet-400/50 cursor-pointer"
                  onClick={() => router.push('/match')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <Puzzle className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="font-medium">Excellent Match</p>
                        <p className="text-sm text-white/50">
                          {match.match_score_value}% fit score
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-violet-500/20 text-violet-400 border-0">
                      {match.match_score_value}%
                    </Badge>
                  </div>
                  <p className="text-sm text-white/40 mt-3">
                    {match.recommended_action}
                  </p>
                </div>
              );
            }) : (
              <div className="p-8 text-center surface-subtle rounded-xl">
                <Target className="w-8 h-8 mx-auto mb-3 text-white/20" />
                <p className="text-sm text-white/40">Check Match page for opportunities</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ============================================
          READY RESOURCES
          ============================================ */}
      {readyResources.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-medium">Ready Resources</h2>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {readyResources.map((resource) => {
              const buyer = resource.item as Buyer;
              return (
                <div
                  key={buyer.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 cursor-pointer"
                  onClick={() => router.push('/buyers')}
                >
                  <UserCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-sm">{buyer.name}</p>
                    <p className="text-xs text-white/40">
                      {formatCurrency(buyer.budget_max)} · Ready to proceed
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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

function Metric({ value, label, color }: { value: number; label: string; color?: 'red' | 'emerald' }) {
  return (
    <div className="text-right">
      <p className={`text-2xl font-semibold ${color === 'red' ? 'text-red-400' : color === 'emerald' ? 'text-emerald-400' : ''}`}>
        {value}
      </p>
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  action,
  urgency,
  readiness,
  onClick,
}: {
  icon: React.ElementType;
  iconColor: 'orange' | 'violet' | 'red';
  title: string;
  subtitle: string;
  action: string;
  urgency: 'closing' | 'high' | 'normal';
  readiness?: number;
  onClick: () => void;
}) {
  const colors = {
    orange: "bg-orange-500/10 text-orange-400",
    violet: "bg-violet-500/10 text-violet-400",
    red: "bg-red-500/10 text-red-400",
  };
  
  const urgencyLabels = {
    closing: { label: "Closing", className: "bg-red-500/20 text-red-400" },
    high: { label: "High", className: "bg-orange-500/20 text-orange-400" },
    normal: { label: "Normal", className: "bg-blue-500/20 text-blue-400" },
  };
  
  return (
    <div 
      className="group flex items-center justify-between p-5 surface-elevated rounded-2xl hover:border-white/10 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors[iconColor]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <p className="font-medium">{title}</p>
            <Badge className={`text-xs ${urgencyLabels[urgency].className} border-0`}>
              {urgencyLabels[urgency].label}
            </Badge>
          </div>
          <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {readiness && (
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${readiness}%` }}
                />
              </div>
              <span className="text-sm text-white/60">{readiness}%</span>
            </div>
          </div>
        )}
        <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
          {action}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
