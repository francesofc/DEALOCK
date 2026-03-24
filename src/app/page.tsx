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
  ShieldCheck,
  BarChart3,
  CheckCircle,
  Settings
} from "lucide-react";
import { 
  getLeads, 
  getActivities, 
  getMandates, 
  getBuyers, 
  getMatches, 
  getFinanceProfiles 
} from "@/lib/data";
import { getActiveWorkspace, WorkspaceRecord } from "@/lib/data/workspace";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { 
  getSellerNextAction, 
  getBuyerNextAction, 
  getFinanceNextAction,
  getMatchNextAction,
  getDaysSinceLastActivity,
  urgencyBadge,
  urgencyColor,
  UrgencyLevel
} from "@/lib/intelligence/next-actions";
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
import { useTranslation } from "@/lib/i18n";
import { OnboardingTask } from "@/types/onboarding";

const activityTypeMap: Record<ActivityType, { label: string }> = {
  call: { label: "Call" },
  email: { label: "Email" },
  whatsapp: { label: "WhatsApp" },
  meeting: { label: "Meeting" },
  note: { label: "Note" },
  follow_up: { label: "Follow Up" },
  mandate: { label: "Mandate" },
  lead: { label: "Lead" },
  buyer: { label: "Buyer" },
  match: { label: "Match" },
  finance: { label: "Finance" },
};

export default function CommandCenterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [matches, setMatches] = useState<MatchOpportunity[]>([]);
  const [financeProfiles, setFinanceProfiles] = useState<FinanceProfile[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [intelligence, setIntelligence] = useState<Record<string, SellerIntelligence>>({});
  const [workspace, setWorkspace] = useState<WorkspaceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [leadsData, buyersData, matchesData, financeData, activitiesData, mandatesData, workspaceData] = await Promise.all([
        getLeads(),
        getBuyers(),
        getMatches(),
        getFinanceProfiles(),
        getActivities(),
        getMandates(),
        getActiveWorkspace(),
      ]);
      
      setLeads(leadsData);
      setBuyers(buyersData);
      setMatches(matchesData);
      setFinanceProfiles(financeData);
      setActivities(activitiesData.slice(0, 5));
      setMandates(mandatesData);
      setWorkspace(workspaceData);
      
      // Load intelligence for priority sellers
      const priorityLeads = leadsData.filter((l: Lead) => 
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
  // METRICS
  // ============================================
  const metrics = {
    urgentSellers: leads.filter(l => ['mandate_proposed', 'mandate_sent'].includes(l.status)).length,
    qualifiedBuyers: buyers.filter(b => b.status === 'qualified' || b.status === 'viewing_scheduled').length,
    activeMatches: matches.filter(m => m.status !== 'archived' && m.status !== 'closed').length,
    readyBuyers: financeProfiles.filter(f => f.status === 'ready_to_progress' || f.status === 'strong_buyer').length,
    pendingSignatures: mandates.filter(m => m.status === 'sent').length,
    activeMandates: mandates.filter(m => m.status === 'signed').length,
    pipelineValue: leads
      .filter(l => l.status !== 'lost' && l.status !== 'mandate_signed')
      .reduce((sum, l) => sum + (l.price || 0), 0),
  };

  // ============================================
  // DECISION HIERARCHY
  // ============================================

  // URGENT NOW: Actions requiring immediate attention
  const urgentNow = [
    ...leads
      .filter(l => ['mandate_proposed', 'mandate_sent'].includes(l.status))
      .filter(l => {
        const intel = intelligence[l.id];
        return intel && intel.mandate_readiness_score > 60;
      })
      .slice(0, 3)
      .map(l => ({ type: 'seller' as const, item: l, intel: intelligence[l.id] })),
    
    ...matches
      .filter(m => m.priority === 'urgent' && m.status !== 'archived')
      .slice(0, 2)
      .map(m => ({ type: 'match' as const, item: m })),
  ].slice(0, 4);

  // IMPORTANT TODAY: Should act on today
  const importantToday = leads
    .filter(l => ['replied', 'call_scheduled'].includes(l.status))
    .filter(l => {
      const intel = intelligence[l.id];
      return intel && intel.mandate_readiness_score > 50;
    })
    .filter(l => !urgentNow.find(u => u.type === 'seller' && u.item.id === l.id))
    .slice(0, 3)
    .map(l => ({ type: 'seller' as const, item: l, intel: intelligence[l.id] }));

  // STRATEGIC OPPORTUNITIES
  const strategicOpportunities = matches
    .filter(m => m.match_score === 'excellent' && m.status !== 'archived')
    .filter(m => m.priority !== 'urgent')
    .slice(0, 3);

  // BLOCKERS
  const blockers = financeProfiles
    .filter(f => f.status === 'incomplete' || f.status === 'needs_clarification')
    .slice(0, 3);

  // READY RESOURCES
  const readyResources = buyers
    .filter(b => {
      const f = financeProfiles.find(fp => fp.buyer_id === b.id);
      return f && (f.status === 'ready_to_progress' || f.status === 'strong_buyer');
    })
    .slice(0, 3);

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
        <p className="text-white/50 text-sm">Loading command center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <section className="pb-6 border-b border-white/[0.06]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-white/40 mb-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">{t.command_center.title}</h1>
          </div>
          {workspace && (
            <div className="flex items-center gap-3" data-testid="command-center-workspace">
              <span className="text-sm text-white/40">Workspace:</span>
              <span className="font-medium" data-testid="workspace-name">{workspace.agency_name}</span>
            </div>
          )}
        </div>
      </section>

      {/* WORKSPACE STATUS & ONBOARDING */}
      {workspace && workspace.onboarding_status !== 'completed' && (
        <section className="p-5 surface-elevated rounded-xl border-l-2 border-l-amber-400">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Complete Your Workspace Setup</h3>
                <p className="text-sm text-white/50">
                  Finish configuring your agency profile and add your first data to get the most from Dealock.
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-white/10"
                    onClick={() => router.push('/settings/agency')}
                  >
                    Complete Setup
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/onboarding')}
                  >
                    Resume Onboarding
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">
                {workspace.onboarding_checklist?.filter((t: OnboardingTask) => t.isCompleted).length || 0}
                <span className="text-white/30">/{workspace.onboarding_checklist?.length || 4}</span>
              </div>
              <p className="text-xs text-white/40">tasks complete</p>
            </div>
          </div>
        </section>
      )}

      {/* PREMIUM METRICS STRIP */}
      <section className="grid grid-cols-6 gap-4">
        <MetricCard 
          value={metrics.urgentSellers} 
          label={t.command_center.metrics.leads_attention} 
          icon={Flame}
          color="red"
          onClick={() => router.push('/sellers')}
        />
        <MetricCard 
          value={metrics.qualifiedBuyers} 
          label={t.command_center.metrics.exclusivity_candidates} 
          icon={Users}
          color="blue"
          onClick={() => router.push('/buyers')}
        />
        <MetricCard 
          value={metrics.activeMatches} 
          label={t.command_center.metrics.mandate_opportunities} 
          icon={Puzzle}
          color="violet"
          onClick={() => router.push('/match')}
        />
        <MetricCard 
          value={metrics.readyBuyers} 
          label={t.command_center.metrics.exclusivity_candidates} 
          icon={ShieldCheck}
          color="emerald"
          onClick={() => router.push('/finance')}
        />
        <MetricCard 
          value={metrics.activeMandates} 
          label={t.command_center.metrics.active_mandates} 
          icon={FileSignature}
          color="amber"
          onClick={() => router.push('/mandates')}
        />
        <MetricCard 
          value={formatCurrency(metrics.pipelineValue)} 
          label={t.command_center.metrics.stalled_deals} 
          icon={BarChart3}
          color="default"
          isCurrency
        />
      </section>

      {/* ACTION PRIORITIES - Using Next Action Rules */}
      <ActionPrioritiesSection 
        leads={leads}
        buyers={buyers}
        matches={matches}
        financeProfiles={financeProfiles}
        activities={activities}
        mandates={mandates}
        intelligence={intelligence}
      />

      {/* URGENT NOW */}
      {urgentNow.length > 0 && (
        <section>
          <SectionHeader 
            icon={Flame}
            iconColor="red"
            title={t.command_center.sections.urgent_now}
            subtitle={`${urgentNow.length} ${t.command_center.labels.items_requiring_action}`}
          />
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
                    action={intel?.next_best_move.replace(/_/g, ' ') || t.command_center.labels.review_opportunity}
                    badge={{ text: t.command_center.labels.closing, color: "red" }}
                    meta={intel ? `${intel.mandate_readiness_score}% ready` : undefined}
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
                    title={`Match Opportunity · ${match.score_value}% Fit`}
                    subtitle={match.recommended_action}
                    action={t.command_center.labels.contact_buyer}
                    badge={{ text: t.command_center.labels.urgent, color: "red" }}
                    onClick={() => router.push('/match')}
                  />
                );
              }
              return null;
            })}
          </div>
        </section>
      )}

      {/* TWO COLUMN: IMPORTANT TODAY + STRATEGIC OPPORTUNITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* IMPORTANT TODAY */}
        <section>
          <SectionHeader 
            icon={Zap}
            iconColor="amber"
            title={t.command_center.sections.important_today}
            subtitle={t.command_center.labels.schedule_time}
          />
          {importantToday.length > 0 ? (
            <div className="space-y-3">
              {importantToday.map((action) => {
                const lead = action.item as Lead;
                const intel = action.intel;
                return (
                  <CompactCard
                    key={lead.id}
                    onClick={() => router.push(`/sellers/${lead.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lead.owner_name}</p>
                        <p className="text-sm text-white/40">{lead.city}</p>
                      </div>
                      {intel && (
                        <div className="text-right">
                          <span className="text-sm font-medium text-emerald-400">
                            {intel.mandate_readiness_score}%
                          </span>
                          <p className="text-xs text-white/40">{t.command_center.labels.ready.toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                    {intel && (
                      <div className="mt-3 pt-3 border-t border-white/[0.04]">
                        <p className="text-sm text-white/60">
                          {intel.next_best_move.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                  </CompactCard>
                );
              })}
            </div>
          ) : (
            <EmptyStateCompact 
              icon={CheckCircle2}
              message={t.command_center.labels.no_urgent}
            />
          )}
        </section>

        {/* STRATEGIC OPPORTUNITIES */}
        <section>
          <SectionHeader 
            icon={Sparkles}
            iconColor="violet"
            title={t.command_center.sections.strategic_opportunities}
            subtitle={t.command_center.labels.high_value_matches}
          />
          {strategicOpportunities.length > 0 ? (
            <div className="space-y-3">
              {strategicOpportunities.map((match) => (
                <CompactCard
                  key={match.id}
                  onClick={() => router.push('/match')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Puzzle className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{t.command_center.labels.excellent_match}</p>
                      <p className="text-sm text-white/40 truncate">
                        {match.recommended_action}
                      </p>
                    </div>
                    <Badge className="bg-violet-500/20 text-violet-400 border-0">
                      {match.score_value}%
                    </Badge>
                  </div>
                </CompactCard>
              ))}
            </div>
          ) : (
            <EmptyStateCompact 
              icon={Target}
              message={t.command_center.labels.no_matches}
              action={t.command_center.labels.browse_match}
              onAction={() => router.push('/match')}
            />
          )}
        </section>
      </div>

      {/* TWO COLUMN: BLOCKERS + READY RESOURCES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BLOCKERS */}
        <section>
          <SectionHeader 
            icon={AlertTriangle}
            iconColor="amber"
            title={t.command_center.sections.blockers}
            subtitle={t.command_center.labels.issues_preventing}
          />
          {blockers.length > 0 ? (
            <div className="space-y-3">
              {blockers.map((profile) => {
                const buyer = buyers.find(b => b.id === profile.buyer_id);
                if (!buyer) return null;
                
                return (
                  <CompactCard
                    key={profile.id}
                    onClick={() => router.push('/finance')}
                    borderColor="amber"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{buyer.name}</p>
                        <p className="text-sm text-amber-400/70">
                          {profile.missing_documents.length} documents missing
                        </p>
                      </div>
                    </div>
                  </CompactCard>
                );
              })}
            </div>
          ) : (
            <EmptyStateCompact 
              icon={CheckCircle2}
              message={t.command_center.labels.no_blockers}
              variant="success"
            />
          )}
        </section>

        {/* READY RESOURCES */}
        <section>
          <SectionHeader 
            icon={ShieldCheck}
            iconColor="emerald"
            title={t.command_center.sections.ready_resources}
            subtitle={t.command_center.labels.buyers_cleared}
          />
          {readyResources.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {readyResources.map((buyer) => (
                <div
                  key={buyer.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  onClick={() => router.push('/buyers')}
                >
                  <UserCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-sm">{buyer.name}</p>
                    <p className="text-xs text-white/40">
                      {formatCurrency(buyer.budget_max)} · {t.command_center.labels.ready}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyStateCompact 
              icon={Users}
              message={t.command_center.labels.no_ready_buyers}
            />
          )}
        </section>
      </div>

      {/* RECENT ACTIVITY */}
      <section className="pt-6 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <ActivityIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-medium">{t.command_center.sections.recent_activity}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/50 hover:text-white gap-1"
            onClick={() => router.push('/activities')}
          >
            {t.command_center.labels.view_all}
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

// ============================================
// ACTION PRIORITIES SECTION
// ============================================

function ActionPrioritiesSection({
  leads,
  buyers,
  matches,
  financeProfiles,
  activities,
  mandates,
  intelligence,
}: {
  leads: Lead[];
  buyers: Buyer[];
  matches: MatchOpportunity[];
  financeProfiles: FinanceProfile[];
  activities: Activity[];
  mandates: Mandate[];
  intelligence: Record<string, SellerIntelligence>;
}) {
  const router = useRouter();
  
  // Calculate action priorities using rule helpers
  const sellerActions = leads
    .map(lead => {
      const leadActivities = activities.filter(a => a.lead_id === lead.id);
      const mandate = mandates.find(m => m.lead_id === lead.id);
      const nextAction = getSellerNextAction(lead, leadActivities, mandate || null, intelligence[lead.id]?.mandate_readiness_score);
      return { type: 'seller' as const, entity: lead, nextAction };
    })
    .filter(item => item.nextAction.urgency === 'critical' || item.nextAction.urgency === 'high')
    .slice(0, 3);
  
  const buyerActions = buyers
    .map(buyer => {
      const buyerActivities = activities.filter(a => a.buyer_id === buyer.id);
      const finance = financeProfiles.find(f => f.buyer_id === buyer.id);
      const buyerMatches = matches.filter(m => m.buyer_id === buyer.id);
      const nextAction = getBuyerNextAction(buyer, finance || null, buyerActivities, buyerMatches);
      return { type: 'buyer' as const, entity: buyer, nextAction, finance };
    })
    .filter(item => item.nextAction.urgency === 'critical' || item.nextAction.urgency === 'high')
    .slice(0, 3);
  
  const financeBlockers = financeProfiles
    .filter(f => f.status === 'incomplete' || f.status === 'needs_clarification')
    .map(f => {
      const buyer = buyers.find(b => b.id === f.buyer_id);
      const financeActivities = activities.filter(a => a.buyer_id === f.buyer_id);
      const nextAction = getFinanceNextAction(f, financeActivities);
      return { type: 'finance' as const, profile: f, buyer, nextAction };
    })
    .slice(0, 2);
  
  const readyMatches = matches
    .filter(m => m.match_score === 'excellent' && m.status === 'identified')
    .slice(0, 2);
  
  const allPriorities = [
    ...sellerActions.map(s => ({ ...s, key: `seller-${s.entity.id}` })),
    ...buyerActions.map(b => ({ ...b, key: `buyer-${b.entity.id}` })),
    ...financeBlockers.map(f => ({ ...f, key: `finance-${f.profile.id}` })),
  ].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    return urgencyOrder[a.nextAction.urgency] - urgencyOrder[b.nextAction.urgency];
  });
  
  if (allPriorities.length === 0 && readyMatches.length === 0) {
    return (
      <section className="surface-elevated rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-medium text-emerald-400">All caught up</h2>
            <p className="text-sm text-white/50">No critical or high-priority actions pending</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section>
      <SectionHeader 
        icon={Target}
        iconColor="violet"
        title="Action Priorities"
        subtitle={`${allPriorities.length} items need attention`}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {allPriorities.map((item) => {
          if (item.type === 'seller') {
            const lead = item.entity as Lead;
            return (
              <ActionPriorityCard
                key={item.key}
                icon={Building2}
                iconColor="orange"
                title={lead.owner_name}
                subtitle={`${lead.property_type} · ${lead.city}`}
                action={item.nextAction.action}
                urgency={item.nextAction.urgency}
                reason={item.nextAction.reason}
                onClick={() => router.push(`/sellers/${lead.id}`)}
              />
            );
          }
          if (item.type === 'buyer') {
            const buyer = item.entity as Buyer;
            return (
              <ActionPriorityCard
                key={item.key}
                icon={Users}
                iconColor="blue"
                title={buyer.name}
                subtitle={`Budget: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(buyer.budget_max)}`}
                action={item.nextAction.action}
                urgency={item.nextAction.urgency}
                reason={item.nextAction.reason}
                onClick={() => router.push(`/buyers/${buyer.id}`)}
              />
            );
          }
          if (item.type === 'finance') {
            const buyer = item.buyer;
            if (!buyer) return null;
            return (
              <ActionPriorityCard
                key={item.key}
                icon={Wallet}
                iconColor="amber"
                title={buyer.name}
                subtitle="Finance incomplete"
                action={item.nextAction.action}
                urgency={item.nextAction.urgency}
                reason={item.nextAction.reason}
                onClick={() => router.push('/finance')}
              />
            );
          }
          return null;
        })}
        
        {readyMatches.map((match) => (
          <ActionPriorityCard
            key={`match-${match.id}`}
            icon={Puzzle}
            iconColor="violet"
            title="Excellent Match Ready"
            subtitle={match.recommended_action}
            action="Send opportunity now"
            urgency="high"
            reason={`${match.score_value}% fit score - buyer should be contacted`}
            onClick={() => router.push('/match')}
          />
        ))}
      </div>
    </section>
  );
}

function ActionPriorityCard({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  action,
  urgency,
  reason,
  onClick,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle: string;
  action: string;
  urgency: UrgencyLevel;
  reason: string;
  onClick: () => void;
}) {
  const urgencyColors = {
    critical: 'bg-red-500 text-white',
    high: 'bg-amber-500 text-black',
    normal: 'bg-blue-500 text-white',
    low: 'bg-white/20 text-white',
  };
  
  const iconBgColors: Record<string, string> = {
    orange: 'bg-orange-500/10 text-orange-400',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
    violet: 'bg-violet-500/10 text-violet-400',
    red: 'bg-red-500/10 text-red-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
  };
  
  return (
    <div 
      onClick={onClick}
      className="surface-elevated rounded-xl p-4 border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBgColors[iconColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${urgencyColors[urgency]}`}>
              {urgency}
            </span>
          </div>
          <h3 className="font-medium truncate">{title}</h3>
          <p className="text-sm text-white/40 truncate">{subtitle}</p>
          <div className="mt-2 pt-2 border-t border-white/[0.04]">
            <p className="text-sm text-white/70">{action}</p>
            <p className="text-xs text-white/40 mt-0.5">{reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function MetricCard({ 
  value, 
  label, 
  icon: Icon,
  color,
  isCurrency = false,
  onClick
}: { 
  value: string | number;
  label: string;
  icon: React.ElementType;
  color: 'red' | 'blue' | 'violet' | 'emerald' | 'amber' | 'default';
  isCurrency?: boolean;
  onClick?: () => void;
}) {
  const colors = {
    red: "from-red-500/10 to-red-500/5 border-red-500/20",
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
    violet: "from-violet-500/10 to-violet-500/5 border-violet-500/20",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
    default: "from-white/[0.06] to-white/[0.02] border-white/[0.08]",
  };
  
  const iconColors = {
    red: "text-red-400",
    blue: "text-blue-400",
    violet: "text-violet-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    default: "text-white/50",
  };
  
  return (
    <div 
      className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border cursor-pointer hover:brightness-110 transition-all`}
      onClick={onClick}
    >
      <div className={`w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${iconColors[color]}`} />
      </div>
      <p className={`text-xl font-semibold ${isCurrency ? 'text-sm' : ''}`}>{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function SectionHeader({ 
  icon: Icon, 
  iconColor,
  title, 
  subtitle,
}: { 
  icon: React.ElementType; 
  iconColor: 'red' | 'amber' | 'violet' | 'emerald';
  title: string; 
  subtitle: string;
}) {
  const colors = {
    red: "bg-red-500/10 text-red-400",
    amber: "bg-amber-500/10 text-amber-400",
    violet: "bg-violet-500/10 text-violet-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
  };
  
  return (
    <div className="flex items-center gap-3 mb-4">
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

function ActionCard({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  action,
  badge,
  meta,
  onClick,
}: {
  icon: React.ElementType;
  iconColor: 'orange' | 'violet';
  title: string;
  subtitle: string;
  action: string;
  badge: { text: string; color: 'red' };
  meta?: string;
  onClick: () => void;
}) {
  const colors = {
    orange: "bg-orange-500/10 text-orange-400",
    violet: "bg-violet-500/10 text-violet-400",
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
            <Badge className={`bg-${badge.color}-500/20 text-${badge.color}-400 border-0 text-[10px]`}>
              {badge.text}
            </Badge>
          </div>
          <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {meta && (
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: meta }} />
              </div>
              <span className="text-sm text-white/60">{meta}</span>
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

function CompactCard({ 
  children, 
  onClick,
  borderColor = 'default'
}: { 
  children: React.ReactNode;
  onClick: () => void;
  borderColor?: 'default' | 'amber';
}) {
  const borders = {
    default: "border-white/[0.04] hover:border-white/[0.08]",
    amber: "border-amber-500/20 hover:border-amber-500/30",
  };
  
  return (
    <div 
      className={`p-4 surface-subtle rounded-xl ${borders[borderColor]} hover:bg-white/[0.04] transition-all cursor-pointer`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function EmptyStateCompact({ 
  icon: Icon,
  message,
  action,
  onAction,
  variant = 'default'
}: { 
  icon: React.ElementType;
  message: string;
  action?: string;
  onAction?: () => void;
  variant?: 'default' | 'success';
}) {
  const iconColors = variant === 'success' ? "text-emerald-400/50" : "text-white/20";
  
  return (
    <div className="p-8 text-center surface-subtle rounded-xl border border-white/[0.04]">
      <Icon className={`w-8 h-8 mx-auto mb-3 ${iconColors}`} />
      <p className="text-sm text-white/40">{message}</p>
      {action && onAction && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-3 text-white/50 hover:text-white"
          onClick={onAction}
        >
          {action}
        </Button>
      )}
    </div>
  );
}
