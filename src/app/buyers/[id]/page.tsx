"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  MapPin,
  Clock,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Zap,
  User,
  Wallet,
  Building2,
  BedDouble,
  Maximize,
  Edit3,
  Send,
  Home,
  Puzzle,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  FileX,
  Euro,
  Search,
  MessageCircle,
  Plus
} from "lucide-react";
import Link from "next/link";
import { getBuyerById, getActivitiesByBuyerId, getMatches, getLeads, getFinanceProfileByBuyer, updateBuyer, saveFinanceProfile, addActivity } from "@/lib/data";
import { getBuyerNextAction, urgencyColor, getStaleness, getDaysSinceLastActivity } from "@/lib/intelligence/next-actions";
import { Buyer, Activity, MatchOpportunity, Lead, FinanceProfile, BuyerStatus, ActivityType } from "@/types/database";
import { EditDrawer } from "@/components/ui/EditDrawer";
import { BuyerEditPanel } from "@/components/buyers/BuyerEditPanel";
import { ActivityCreatePanel } from "@/components/activities/ActivityCreatePanel";

// ============================================
// STATUS MAPS
// ============================================

const statusMap: Record<BuyerStatus, { label: string; color: string; description: string }> = {
  new: { label: "New", color: "bg-white/10 text-white/70", description: "Initial qualification needed" },
  contacted: { label: "Contacted", color: "bg-amber-500/20 text-amber-400", description: "Awaiting response" },
  qualified: { label: "Qualified", color: "bg-blue-500/20 text-blue-400", description: "Criteria confirmed" },
  viewing_scheduled: { label: "Viewing", color: "bg-violet-500/20 text-violet-400", description: "Property tours booked" },
  offer_pending: { label: "Offer", color: "bg-orange-500/20 text-orange-400", description: "Offer in negotiation" },
  closed: { label: "Closed", color: "bg-emerald-500/20 text-emerald-400", description: "Purchase completed" },
  inactive: { label: "Inactive", color: "bg-red-500/20 text-red-400", description: "Paused or lost" },
};

const seriousnessMap = {
  low: { label: "Browsing", color: "text-white/40", bg: "bg-white/[0.04]" },
  medium: { label: "Interested", color: "text-amber-400", bg: "bg-amber-500/10" },
  high: { label: "Serious", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  very_high: { label: "Committed", color: "text-violet-400", bg: "bg-violet-500/10" },
};

const timelineMap = {
  browsing: { label: "Just browsing", color: "text-white/40" },
  '3_months': { label: "Within 3 months", color: "text-amber-400" },
  '1_month': { label: "Within 1 month", color: "text-emerald-400" },
  immediate: { label: "Immediate", color: "text-violet-400" },
};

const documentLabels: Record<string, string> = {
  id_document: "ID Document",
  proof_income: "Proof of Income",
  bank_statements: "Bank Statements",
  tax_returns: "Tax Returns",
  employment_contract: "Employment Contract",
  existing_property_docs: "Property Documents",
  loan_pre_approval: "Loan Pre-approval",
};

// ============================================
// FORMAT HELPERS
// ============================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function BuyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const buyerId = params.id as string;
  
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [finance, setFinance] = useState<FinanceProfile | null>(null);
  const [matches, setMatches] = useState<MatchOpportunity[]>([]);
  const [leads, setLeads] = useState<Record<string, Lead>>({});
  const [loading, setLoading] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editedBuyer, setEditedBuyer] = useState<Buyer | null>(null);
  const [editedFinance, setEditedFinance] = useState<FinanceProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Activity creation state
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [newActivityData, setNewActivityData] = useState<{ type: ActivityType; content: string; operator_name: string }>({
    type: "note",
    content: "",
    operator_name: "Agent",
  });
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [buyerData, activitiesData, financeData, matchesData, leadsData] = await Promise.all([
        getBuyerById(buyerId),
        getActivitiesByBuyerId(buyerId),
        getFinanceProfileByBuyer(buyerId),
        getMatches(),
        getLeads(),
      ]);
      
      setBuyer(buyerData);
      setActivities(activitiesData);
      setFinance(financeData);
      
      // Filter matches for this buyer
      const buyerMatches = matchesData.filter(m => m.buyer_id === buyerId);
      setMatches(buyerMatches);
      
      // Create leads map for match display
      setLeads(leadsData.reduce((acc, l) => ({ ...acc, [l.id]: l }), {}));
      
      setLoading(false);
    }
    loadData();
  }, [buyerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading buyer profile...</p>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-white/50">Buyer not found</p>
        <Link href="/buyers" className="mt-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t.buyers.back_to}
          </Button>
        </Link>
      </div>
    );
  }

  const status = statusMap[buyer.status];
  const seriousness = seriousnessMap[buyer.seriousness];
  const timeline = timelineMap[buyer.timeline];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/buyers">
          <Button variant="ghost" size="sm" className="gap-2 text-white/60 hover:text-white hover:bg-white/[0.04]">
            <ArrowLeft className="w-4 h-4" />
            {t.buyers.back_to}
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-white/10 hover:bg-white/[0.04]"
          onClick={() => {
            setEditedBuyer(buyer);
            setEditedFinance(finance);
            setIsEditDrawerOpen(true);
          }}
        >
          <Edit3 className="w-4 h-4" />
          {t.buyers.edit_profile}
        </Button>
      </div>

      {/* HERO STRIP */}
      <section className="mb-8">
        <div className="surface-elevated rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Identity */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${status.color} border-0`}>
                  {status.label}
                </Badge>
                <Badge className={`${seriousness.bg} ${seriousness.color} border-0`}>
                  {seriousness.label}
                </Badge>
                {buyer.pre_approved && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-0">
                    {t.buyers.pre_approved_badge}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-semibold tracking-tight mb-2">
                {buyer.name}
              </h1>
              <div className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" />
                <span>{t.buyers.targeting}: {buyer.target_areas.slice(0, 2).join(', ')}</span>
                {buyer.target_areas.length > 2 && (
                  <span className="text-white/40">+{buyer.target_areas.length - 2} more</span>
                )}
              </div>
            </div>

            {/* Center: Budget */}
            <div className="lg:text-center lg:px-8 lg:border-x border-white/[0.06]">
              <p className="text-sm text-white/40 mb-1">{t.buyers.budget_range}</p>
              <p className="text-3xl font-semibold tracking-tight">
                {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
              </p>
              <p className="text-sm text-white/50 mt-1">
                Timeline: <span className={timeline.color}>{timeline.label}</span>
              </p>
            </div>
            
            {/* Right: {t.buyers.finance_readiness} */}
            <div className="lg:text-right">
              <p className="text-sm text-white/40 mb-2">{t.buyers.finance_readiness}</p>
              {finance ? (
                <>
                  <div className="flex items-center lg:justify-end gap-3">
                    <div className="w-32 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          finance.completion_percentage > 80 ? 'bg-emerald-400' :
                          finance.completion_percentage > 50 ? 'bg-amber-400' : 'bg-white/40'
                        }`}
                        style={{ width: `${finance.completion_percentage}%` }}
                      />
                    </div>
                    <span className="text-2xl font-semibold">{finance.completion_percentage}%</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1.5">
                    {finance.status === 'strong_buyer' ? 'Strong buyer position' :
                     finance.status === 'ready_to_progress' ? 'Ready to make offers' :
                     finance.status === 'under_review' ? 'Documents under review' :
                     'Documentation needed'}
                  </p>
                </>
              ) : (
                <p className="text-white/40">{t.buyers.no_finance_profile}</p>
              )}
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-white/[0.06]">
            <ActionButton icon={Phone} label="Call" />
            <ActionButton icon={Mail} label="Email" />
            <ActionButton icon={MessageSquare} label="WhatsApp" />
            <ActionButton icon={Calendar} label="Schedule Viewing" />
            <div className="flex-1" />
            <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90">
              <Puzzle className="w-4 h-4" />
              Find Matches
            </Button>
          </div>
        </div>
      </section>

      {/* NEXT ACTION CARD */}
      <BuyerNextActionCard 
        buyer={buyer}
        activities={activities}
        finance={finance}
        matches={matches}
      />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Qualification & Opportunities */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Buyer Qualification */}
          <section className="surface-elevated rounded-2xl p-6">
            <SectionHeader 
              icon={Target} 
              title="Qualification Profile" 
              subtitle="Buyer criteria and search preferences"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <QualificationCard 
                label="Seriousness"
                value={seriousness.label}
                icon={TrendingUp}
                color={buyer.seriousness === 'very_high' || buyer.seriousness === 'high' ? 'positive' : 'neutral'}
              />
              <QualificationCard 
                label="Timeline"
                value={timeline.label}
                icon={Clock}
                color={buyer.timeline === 'immediate' ? 'positive' : 'neutral'}
              />
              <QualificationCard 
                label="Buyer Type"
                value={buyer.buyer_type.replace('_', ' ')}
                icon={User}
                color="neutral"
              />
              <QualificationCard 
                label="Status"
                value={status.label}
                icon={CheckCircle}
                color={buyer.status === 'qualified' || buyer.status === 'viewing_scheduled' ? 'positive' : 'neutral'}
              />
            </div>

            {/* Search Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-4 h-4 text-white/40" />
                  <span className="text-sm font-medium">Property Preferences</span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {buyer.property_types.map((type, i) => (
                      <Badge key={i} variant="outline" className="border-white/10">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    {buyer.min_bedrooms && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5" />
                        Min {buyer.min_bedrooms} beds
                      </span>
                    )}
                    {buyer.min_area_m2 && (
                      <span className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5" />
                        Min {buyer.min_area_m2}m²
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-white/40" />
                  <span className="text-sm font-medium">Target Areas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {buyer.target_areas.map((area, i) => (
                    <Badge key={i} variant="outline" className="border-white/10">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Blockers */}
            {buyer.notes && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider">Notes / Blockers</span>
                </div>
                <p className="text-sm text-white/70">{buyer.notes}</p>
              </div>
            )}
          </section>

          {/* Finance Readiness */}
          {finance && (
            <section className="surface-elevated rounded-2xl p-6">
              <SectionHeader 
                icon={ShieldCheck} 
                title="Finance Readiness" 
                subtitle="Documentation and affordability assessment"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <FinanceMetric 
                  label="Annual Income"
                  value={formatCurrency(finance.annual_income || 0)}
                />
                <FinanceMetric 
                  label="Down Payment"
                  value={formatCurrency(finance.available_down_payment || 0)}
                />
                <FinanceMetric 
                  label="Max Budget"
                  value={formatCurrency(finance.estimated_max_budget || 0)}
                />
                <FinanceMetric 
                  label="Monthly Payment"
                  value={formatCurrency(finance.estimated_monthly_payment || 0)}
                />
              </div>

              {/* Document Status */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Document Checklist</span>
                  <span className="text-sm text-white/50">{finance.completion_percentage}% complete</span>
                </div>
                <Progress value={finance.completion_percentage} className="h-2 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {finance.documents.map((doc, i) => (
                    <div 
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                        doc.present 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-white/[0.03] text-white/40'
                      }`}
                    >
                      {doc.present ? (
                        <FileCheck className="w-4 h-4" />
                      ) : (
                        <FileX className="w-4 h-4" />
                      )}
                      <span>{documentLabels[doc.type] || doc.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Documents */}
              {finance.missing_documents.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">Missing Documents</span>
                  </div>
                  <p className="text-sm text-white/60">
                    {finance.missing_documents.map(d => documentLabels[d] || d).join(', ')}
                  </p>
                </div>
              )}

              {/* Recommended Actions */}
              {finance.recommended_actions.length > 0 && finance.recommended_actions[0] !== 'Proceed with confidence' && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Recommended Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {finance.recommended_actions.map((action, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/60 text-sm">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Match Opportunities */}
          <section>
            <SectionHeader 
              icon={Puzzle}
              title="Match Opportunities"
              subtitle={matches.length > 0 ? `${matches.length} property ${matches.length === 1 ? 'match' : 'matches'} found` : "Properties matching this buyer's criteria"}
            />
            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches
                  .sort((a, b) => {
                    // Sort: excellent matches first, then by score, then by priority
                    const scoreOrder = { excellent: 3, good: 2, fair: 1, weak: 0 };
                    const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
                    if (scoreOrder[a.match_score] !== scoreOrder[b.match_score]) {
                      return scoreOrder[b.match_score] - scoreOrder[a.match_score];
                    }
                    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                      return priorityOrder[b.priority] - priorityOrder[a.priority];
                    }
                    return b.score_value - a.score_value;
                  })
                  .map((match) => {
                    // Support both new schema (target_id) and legacy (seller_id)
                    const leadId = match.target_type === 'seller' ? match.target_id : match.seller_id;
                    if (!leadId) return null;
                    const lead = leads[leadId];
                    if (!lead) return null;
                    
                    // Determine if finance is blocking this match
                    const isFinanceBlocking = !finance || 
                      (finance.status !== 'ready_to_progress' && finance.status !== 'strong_buyer');
                    
                    // Determine next action based on match state and finance
                    let nextAction = match.recommended_action;
                    let actionDisabled = false;
                    let actionLabel = "Send Opportunity";
                    
                    if (isFinanceBlocking) {
                      actionLabel = "Finance Pending";
                      actionDisabled = true;
                    } else if (match.blockers && match.blockers.length > 0) {
                      actionLabel = "Resolve Blockers";
                      actionDisabled = true;
                    } else if (match.status === 'contacted_buyer') {
                      actionLabel = "Follow Up";
                    } else if (['viewing_scheduled', 'offer_received', 'negotiating', 'closed'].includes(match.status)) {
                      actionLabel = "In Progress";
                      actionDisabled = true;
                    }
                    
                    return (
                      <div 
                        key={match.id}
                        className="surface-subtle rounded-xl p-4 hover:bg-white/[0.04] transition-colors cursor-pointer group"
                        onClick={() => router.push(`/sellers/${lead.id}`)}
                      >
                        {/* Header: Property + Score */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              match.match_score === 'excellent' ? 'bg-violet-500/10' :
                              match.match_score === 'good' ? 'bg-emerald-500/10' :
                              'bg-amber-500/10'
                            }`}>
                              <Building2 className={`w-5 h-5 ${
                                match.match_score === 'excellent' ? 'text-violet-400' :
                                match.match_score === 'good' ? 'text-emerald-400' :
                                'text-amber-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">{lead.neighborhood}, {lead.city}</p>
                              <p className="text-sm text-white/40">
                                {lead.property_type} · {formatCurrency(lead.price)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${
                              match.match_score === 'excellent' ? 'bg-violet-500/20 text-violet-400' :
                              match.match_score === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-amber-500/20 text-amber-400'
                            } border-0`}>
                              {match.score_value}% Match
                            </Badge>
                            <p className="text-xs text-white/30 mt-1 capitalize">{match.match_score}</p>
                          </div>
                        </div>
                        
                        {/* Match Details */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 rounded-lg bg-white/[0.04] text-xs text-white/50">
                            Target: {match.target_type === 'mandate' ? 'Mandate' : 'Seller'}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs ${
                            match.priority === 'urgent' ? 'bg-red-500/15 text-red-400' :
                            match.priority === 'high' ? 'bg-orange-500/15 text-orange-400' :
                            match.priority === 'medium' ? 'bg-blue-500/15 text-blue-400' :
                            'bg-white/[0.04] text-white/50'
                          }`}>
                            {match.priority} priority
                          </span>
                          {match.blockers && match.blockers.length > 0 && (
                            <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {match.blockers.length} blocker{match.blockers.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        {/* Match Reasons */}
                        {match.match_reasons && match.match_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {match.match_reasons.slice(0, 3).map((reason, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400/80 text-[10px]">
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Finance Blocker Warning */}
                        {isFinanceBlocking && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-xs text-amber-400/80">
                              Finance not ready — resolve documents first
                            </p>
                          </div>
                        )}
                        
                        {/* Footer: Action + Status */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                          <p className="text-sm text-white/50">{match.recommended_action}</p>
                          <Button 
                            size="sm" 
                            variant={actionDisabled ? "ghost" : "default"}
                            className={`gap-2 ${
                              actionDisabled 
                                ? 'text-white/30 hover:text-white/50' 
                                : 'bg-white text-black hover:bg-white/90'
                            }`}
                            disabled={actionDisabled}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {actionLabel}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <EmptyState 
                icon={Search} 
                message="No matches found yet" 
                action="Browse sellers to find matches"
              />
            )}
          </section>

          {/* Activity Timeline */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-medium">Activity Timeline</h2>
                  <p className="text-sm text-white/40">Recent interactions</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-white/10 hover:bg-white/[0.04]"
                onClick={() => setIsActivityDrawerOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Activity
              </Button>
            </div>
            <div className="space-y-1">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <EmptyState icon={Clock} message="No activity recorded yet" />
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Quick Actions & Context */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Communication Assistance */}
          <div className="surface-elevated rounded-2xl p-6">
            <SectionHeader 
              icon={MessageCircle}
              title="Communication"
              compact
            />
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Suggested Message</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  "Hi {buyer.name.split(' ')[0]}, I found a {buyer.property_types[0] || 'property'} in {buyer.target_areas[0] || 'your target area'} that matches your criteria. Would you like to schedule a viewing?"
                </p>
                <Button variant="ghost" size="sm" className="mt-3 gap-2 text-white/50 hover:text-white">
                  <Send className="w-3.5 h-3.5" />
                  Copy Message
                </Button>
              </div>

              <div className="space-y-2">
                <ActionRow icon={Phone} label="Call to discuss options" />
                <ActionRow icon={Calendar} label="Schedule property tour" />
                <ActionRow icon={Mail} label="Send market update" />
              </div>
            </div>
          </div>

          {/* Next Action */}
          {buyer.next_action && (
            <div className="surface-elevated rounded-2xl p-6">
              <SectionHeader 
                icon={Zap}
                title="Next Action"
                compact
              />
              <p className="text-white/80 mb-2">{buyer.next_action}</p>
              {buyer.next_action_date && (
                <p className="text-sm text-white/50">
                  Due: {new Date(buyer.next_action_date).toLocaleDateString()}
                </p>
              )}
              <Button className="w-full mt-4 gap-2 bg-white text-black hover:bg-white/90">
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </Button>
            </div>
          )}

          {/* Cash Buyer Badge */}
          {buyer.cash_buyer && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-emerald-400">Cash Buyer</p>
                  <p className="text-sm text-emerald-400/70">No financing needed</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="surface-subtle rounded-2xl p-6">
            <SectionHeader 
              icon={User}
              title="Contact Information"
              compact
            />
            <div className="space-y-3">
              <ContactItem icon={Mail} label="Email" value={buyer.email} />
              <ContactItem icon={Phone} label="Phone" value={buyer.phone} />
              <ContactItem icon={MapPin} label="Preferred Language" value={buyer.language_preference.toUpperCase()} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      {editedBuyer && (
        <EditDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => {
            setIsEditDrawerOpen(false);
            setEditedBuyer(null);
            setEditedFinance(null);
          }}
          title="Edit Buyer Profile"
          subtitle={`Editing ${buyer.name}`}
          onSave={async () => {
            setIsSaving(true);
            // Persist to Supabase (with localStorage fallback)
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await updateBuyer(editedBuyer);
            if (editedFinance) {
              await saveFinanceProfile(editedFinance);
            }
            setBuyer(editedBuyer);
            if (editedFinance) {
              setFinance(editedFinance);
            }
            setIsSaving(false);
            setIsEditDrawerOpen(false);
          }}
          isSaving={isSaving}
        >
          <BuyerEditPanel
            buyer={editedBuyer}
            finance={editedFinance}
            onChange={setEditedBuyer}
            onFinanceChange={setEditedFinance}
          />
        </EditDrawer>
      )}

      {/* Add Activity Drawer */}
      <EditDrawer
        isOpen={isActivityDrawerOpen}
        onClose={() => {
          setIsActivityDrawerOpen(false);
          setNewActivityData({ type: "note", content: "", operator_name: "Agent" });
        }}
        title="Add Activity"
        subtitle="Log an interaction or note"
        onSave={async () => {
          if (!newActivityData.content.trim()) return;
          
          setIsAddingActivity(true);
          try {
            const newActivity = await addActivity({
              type: newActivityData.type,
              content: newActivityData.content,
              operator_name: newActivityData.operator_name,
              lead_id: null,
              buyer_id: buyerId,
              match_id: null,
              mandate_id: null,
            });
            
            // Update local state immediately
            setActivities(prev => [newActivity, ...prev]);
            
            // Close drawer and reset form
            setIsActivityDrawerOpen(false);
            setNewActivityData({ type: "note", content: "", operator_name: "Agent" });
          } catch (error) {
            console.error("Failed to add activity:", error);
          } finally {
            setIsAddingActivity(false);
          }
        }}
        isSaving={isAddingActivity}
        saveLabel="Save Activity"
      >
        <ActivityCreatePanel 
          onChange={setNewActivityData}
          defaultOperator="Agent"
        />
      </EditDrawer>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function ActionButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
}

function SectionHeader({ 
  icon: Icon, 
  title, 
  subtitle,
  compact = false
}: { 
  icon: React.ElementType; 
  title: string; 
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'mb-4' : 'mb-6'}`}>
      <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="font-medium">{title}</h2>
        {subtitle && <p className="text-sm text-white/40">{subtitle}</p>}
      </div>
    </div>
  );
}

function BuyerNextActionCard({ 
  buyer, 
  activities, 
  finance,
  matches
}: { 
  buyer: Buyer; 
  activities: Activity[]; 
  finance: FinanceProfile | null;
  matches: MatchOpportunity[];
}) {
  const nextAction = getBuyerNextAction(buyer, finance, activities, matches);
  const daysSinceActivity = getDaysSinceLastActivity(activities);
  const staleness = getStaleness(daysSinceActivity);
  
  return (
    <section className="mb-8">
      <div className={`surface-elevated rounded-2xl p-6 border ${urgencyColor(nextAction.urgency)}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Action */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase tracking-wider ${
                nextAction.urgency === 'critical' ? 'bg-red-500 text-white' :
                nextAction.urgency === 'high' ? 'bg-amber-500 text-black' :
                nextAction.urgency === 'normal' ? 'bg-blue-500 text-white' :
                'bg-white/20 text-white'
              }`}>
                {nextAction.urgency}
              </span>
              {daysSinceActivity > 3 && (
                <span className={`text-xs ${staleness.color}`}>
                  {staleness.label} · {daysSinceActivity} days
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-1">{nextAction.action}</h2>
            <p className="text-sm text-white/60">{nextAction.reason}</p>
            {nextAction.suggested && (
              <p className="text-sm text-white/40 mt-2">
                <span className="text-white/50">Suggested:</span> {nextAction.suggested}
              </p>
            )}
          </div>
          
          {/* Right: Quick Action */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="gap-2 bg-white text-black hover:bg-white/90"
            >
              <Zap className="w-4 h-4" />
              Take Action
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function QualificationCard({ 
  label, 
  value, 
  icon: Icon,
  color 
}: { 
  label: string; 
  value: string; 
  icon: React.ElementType;
  color: 'neutral' | 'positive';
}) {
  const colors = {
    neutral: 'bg-white/[0.04] text-white/80 border-white/[0.06]',
    positive: 'bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 opacity-60" />
        <p className="text-[10px] uppercase tracking-wider opacity-60">{label}</p>
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function FinanceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.03]">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors group surface-subtle">
      <div className="w-2 h-2 rounded-full bg-white/20 mt-2" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-medium">{activityTypeMap[activity.type]?.label || activity.type}</p>
            <span className="text-xs text-white/30">• {activity.operator_name}</span>
          </div>
          <span className="text-xs text-white/30">
            {new Date(activity.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-white/50 mt-0.5">{activity.content}</p>
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <Button variant="ghost" className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/[0.04]">
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
}

function ContactItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-white/30" />
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ 
  icon: Icon, 
  message,
  action
}: { 
  icon: React.ElementType; 
  message: string;
  action?: string;
}) {
  return (
    <div className="text-center py-12 text-white/30 surface-subtle rounded-xl">
      <Icon className="w-8 h-8 mx-auto mb-3 opacity-50" />
      <p className="text-sm">{message}</p>
      {action && <p className="text-xs text-white/20 mt-1">{action}</p>}
    </div>
  );
}

const activityTypeMap: Record<string, { label: string }> = {
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
