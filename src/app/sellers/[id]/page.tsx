"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  FileSignature,
  MapPin,
  Clock,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Zap,
  User,
  AlertCircle,
  Building2,
  Euro,
  Maximize,
  BedDouble,
  Edit3,
  Send,
  ChevronRight,
  Shield,
  XCircle,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { getLeadById, getActivitiesByLeadId, getMandateByLeadId } from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { Lead, Activity, Mandate, LeadStatus, MandateStatus, ActivityType } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";
import { EditDrawer } from "@/components/ui/EditDrawer";
import { SellerEditPanel } from "@/components/sellers/SellerEditPanel";
import { useTranslation } from "@/lib/i18n";

// ============================================
// STATUS MAPS
// ============================================

const statusMap: Record<LeadStatus, { label: string; color: string; description: string }> = {
  new: { label: "New Lead", color: "bg-white/10 text-white/70", description: "Initial contact needed" },
  qualified: { label: "Qualified", color: "bg-emerald-500/20 text-emerald-400", description: "Criteria confirmed" },
  contacted: { label: "Contacted", color: "bg-amber-500/20 text-amber-400", description: "Awaiting response" },
  replied: { label: "Replied", color: "bg-blue-500/20 text-blue-400", description: "Engaged in conversation" },
  call_scheduled: { label: "Meeting Set", color: "bg-violet-500/20 text-violet-400", description: "Meeting scheduled" },
  mandate_proposed: { label: "Proposal Out", color: "bg-orange-500/20 text-orange-400", description: "Mandate proposed" },
  mandate_sent: { label: "Sent for Signature", color: "bg-cyan-500/20 text-cyan-400", description: "Pending signature" },
  mandate_signed: { label: "Signed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", description: "Exclusivity secured" },
  lost: { label: "Lost", color: "bg-red-500/20 text-red-400", description: "Opportunity closed" },
};

const mandateStatusMap: Record<MandateStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-white/10 text-white/70" },
  sent: { label: "Sent", color: "bg-cyan-500/20 text-cyan-400" },
  signed: { label: "Signed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  expired: { label: "Expired", color: "bg-amber-500/20 text-amber-400" },
  terminated: { label: "Terminated", color: "bg-red-500/20 text-red-400" },
};

const activityTypeMap: Record<ActivityType, { label: string; icon: React.ElementType }> = {
  call: { label: "Call", icon: Phone },
  email: { label: "Email", icon: Mail },
  whatsapp: { label: "WhatsApp", icon: MessageSquare },
  meeting: { label: "Meeting", icon: Calendar },
  note: { label: "Note", icon: Edit3 },
  mandate: { label: "Mandate", icon: FileSignature },
  lead: { label: "Lead", icon: User },
  buyer: { label: "Buyer", icon: User },
  match: { label: "Match", icon: Sparkles },
  finance: { label: "Finance", icon: Euro },
};

// ============================================
// FORMAT HELPERS
// ============================================

const formatMindset = (mindset: string) => {
  return mindset.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function SellerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const leadId = params.id as string;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mandate, setMandate] = useState<Mandate | null>(null);
  const [intelligence, setIntelligence] = useState<SellerIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [leadData, activitiesData, mandateData] = await Promise.all([
        getLeadById(leadId),
        getActivitiesByLeadId(leadId),
        getMandateByLeadId(leadId),
      ]);
      
      setLead(leadData);
      setActivities(activitiesData);
      setMandate(mandateData);
      
      if (leadData) {
        const intel = await getLeadIntelligence(leadId, leadData);
        setIntelligence(intel);
      }
      
      setLoading(false);
    }
    loadData();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading seller profile...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-white/50">Seller not found</p>
        <Link href="/sellers" className="mt-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t.leads.back_to}
          </Button>
        </Link>
      </div>
    );
  }

  const status = statusMap[lead.status];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/sellers">
          <Button variant="ghost" size="sm" className="gap-2 text-white/60 hover:text-white hover:bg-white/[0.04]">
            <ArrowLeft className="w-4 h-4" />
            Back to Sellers
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-white/10 hover:bg-white/[0.04]"
            onClick={() => {
              setEditedLead(lead);
              setIsEditDrawerOpen(true);
            }}
          >
            <Edit3 className="w-4 h-4" />
            {t.leads.edit}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/[0.04]">
            <Sparkles className="w-4 h-4" />
            {t.leads.refresh_analysis}
          </Button>
        </div>
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
                <span className="text-white/40 text-sm">
                  {lead.language_preference.toUpperCase()}
                </span>
              </div>
              
              <h1 className="text-3xl font-semibold tracking-tight mb-2">
                {lead.owner_name}
              </h1>
              <div className="flex items-center gap-2 text-white/60">
                <Building2 className="w-4 h-4" />
                <span>{lead.property_type}</span>
                <span className="text-white/30">·</span>
                <MapPin className="w-4 h-4" />
                <span>{lead.neighborhood}, {lead.city}</span>
              </div>
            </div>

            {/* Center: Value */}
            <div className="lg:text-center lg:px-8 lg:border-x border-white/[0.06]">
              <p className="text-sm text-white/40 mb-1">{t.leads.property_value}</p>
              <p className="text-3xl font-semibold tracking-tight">{formatPrice(lead.price)}</p>
              <p className="text-sm text-white/50 mt-1">{lead.area_m2}m² · {lead.bedrooms || 0} {t.leads.beds}</p>
            </div>
            
            {/* Right: Readiness */}
            {intelligence && (
              <div className="lg:text-right">
                <p className="text-sm text-white/40 mb-2">{t.leads.mandate_readiness}</p>
                <div className="flex items-center lg:justify-end gap-3">
                  <div className="w-32 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        intelligence.mandate_readiness_score > 70 ? 'bg-emerald-400' :
                        intelligence.mandate_readiness_score > 40 ? 'bg-amber-400' : 'bg-white/40'
                      }`}
                      style={{ width: `${intelligence.mandate_readiness_score}%` }}
                    />
                  </div>
                  <span className="text-2xl font-semibold">{intelligence.mandate_readiness_score}%</span>
                </div>
                {intelligence.estimated_days_to_mandate && (
                  <p className="text-xs text-white/40 mt-1.5">
                    ~{intelligence.estimated_days_to_mandate} days estimated to close
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-white/[0.06]">
            <ActionButton icon={Phone} label="Call" />
            <ActionButton icon={Mail} label="Email" />
            <ActionButton icon={MessageSquare} label="WhatsApp" />
            <ActionButton icon={Calendar} label="Schedule" />
            <div className="flex-1" />
            <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90">
              <FileSignature className="w-4 h-4" />
              {mandate ? 'Update Mandate' : 'Propose Mandate'}
            </Button>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Strategic Intelligence & Communication */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Strategic Intelligence */}
          {intelligence && (
            <section className="surface-elevated rounded-2xl p-6">
              <SectionHeader 
                icon={Target} 
                title="Strategic Intelligence" 
                subtitle="AI-powered seller analysis"
              />

              {/* Core Insights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <InsightCard 
                  label="Mindset"
                  value={formatMindset(intelligence.seller_mindset)}
                  icon={User}
                  color="neutral"
                />
                <InsightCard 
                  label="Relationship"
                  value={formatMindset(intelligence.relationship_state)}
                  icon={MessageCircle}
                  color={intelligence.relationship_state === 'cold' ? 'warning' : 'positive'}
                />
                <InsightCard 
                  label="Momentum"
                  value={formatMindset(intelligence.deal_momentum)}
                  icon={TrendingUp}
                  color={intelligence.deal_momentum === 'weak' || intelligence.deal_momentum === 'at_risk' ? 'warning' : 'positive'}
                />
                <InsightCard 
                  label="Approach"
                  value={formatMindset(intelligence.recommended_angle)}
                  icon={Lightbulb}
                  color="neutral"
                />
              </div>

              {/* Next Best Move */}
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Next Best Move</p>
                    <p className="text-xl font-medium mb-3">
                      {formatMindset(intelligence.next_best_move)}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <TimingBadge timing={intelligence.suggested_timing} />
                      <ToneBadge tone={formatMindset(intelligence.tone_to_use)} />
                    </div>
                  </div>
                  <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90 shrink-0">
                    <Zap className="w-4 h-4" />
                    Execute
                  </Button>
                </div>
              </div>

              {/* Suggested Opening */}
              <div className="p-5 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs text-emerald-400/70 uppercase tracking-wider">Suggested Opening</p>
                </div>
                <p className="text-white/80 leading-relaxed">
                  "{intelligence.suggested_opening.replace('{city}', lead.city)}"
                </p>
                <Button variant="ghost" size="sm" className="mt-3 gap-2 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10">
                  <Send className="w-3.5 h-3.5" />
                  Copy Message
                </Button>
              </div>

              {/* What to Avoid */}
              {intelligence.what_to_avoid.length > 0 && (
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">What to Avoid</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {intelligence.what_to_avoid.slice(0, 4).map((item, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-red-500/[0.08] text-red-400/80 text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Signals */}
          {intelligence && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intelligence.positive_signals.length > 0 && (
                <SignalsCard 
                  title="Positive Signals" 
                  icon={CheckCircle} 
                  iconColor="text-emerald-400"
                  signals={intelligence.positive_signals}
                />
              )}
              {intelligence.risk_signals.length > 0 && (
                <SignalsCard 
                  title="Watch For" 
                  icon={AlertTriangle} 
                  iconColor="text-amber-400"
                  signals={intelligence.risk_signals}
                />
              )}
            </div>
          )}

          {/* Activity Timeline */}
          <section>
            <SectionHeader 
              icon={Clock}
              title="Activity Timeline"
              subtitle="Recent interactions and notes"
            />
            <div className="space-y-1">
              {activities.length > 0 ? (
                activities.map((activity) => {
                  const ActivityIcon = activityTypeMap[activity.type].icon;
                  return (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors group surface-subtle"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                        <ActivityIcon className="w-4 h-4 text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{activityTypeMap[activity.type].label}</p>
                          <span className="text-xs text-white/30">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 mt-0.5">{activity.content}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState icon={Clock} message="No activity recorded yet" />
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Mandate, Property, Context */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Mandate Status */}
          <div className="surface-elevated rounded-2xl p-6">
            <SectionHeader 
              icon={FileSignature}
              title="Mandate Status"
              compact
            />
            
            {mandate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                  <span className="text-white/60 text-sm">Status</span>
                  <Badge className={`${mandateStatusMap[mandate.status]?.color || mandateStatusMap.draft.color} border-0`}>
                    {mandateStatusMap[mandate.status]?.label || mandate.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                  <span className="text-white/60 text-sm">Type</span>
                  <span className="text-white font-medium">
                    {mandate.exclusive ? 'Exclusive' : 'Non-Exclusive'}
                  </span>
                </div>
                
                {mandate.status === 'signed' && (
                  <Button className="w-full gap-2 bg-white text-black hover:bg-white/90">
                    <Sparkles className="w-4 h-4" />
                    Activation Strategy
                  </Button>
                )}
                {mandate.status === 'sent' && (
                  <Button className="w-full gap-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-0">
                    <Clock className="w-4 h-4" />
                    Follow Up
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                  <FileSignature className="w-5 h-5 text-white/30" />
                </div>
                <p className="text-white/40 text-sm mb-1">No mandate yet</p>
                <p className="text-white/30 text-xs mb-4">
                  {intelligence?.mandate_readiness_score && intelligence.mandate_readiness_score > 60 
                    ? 'Ready to propose' 
                    : 'Continue building relationship'}
                </p>
                <Button className="w-full gap-2 bg-white text-black hover:bg-white/90">
                  <FileSignature className="w-4 h-4" />
                  Propose Mandate
                </Button>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="surface-subtle rounded-2xl p-6">
            <SectionHeader 
              icon={Building2}
              title="Property Details"
              compact
            />
            <div className="space-y-4">
              <DetailItem icon={Building2} label="Type" value={lead.property_type} />
              <DetailItem icon={MapPin} label="Location" value={`${lead.neighborhood}, ${lead.city}`} />
              <DetailItem icon={Maximize} label="Area" value={`${lead.area_m2} m²`} />
              {lead.bedrooms !== null && (
                <DetailItem icon={BedDouble} label="Bedrooms" value={lead.bedrooms.toString()} />
              )}
              <DetailItem icon={Euro} label="Asking Price" value={formatPrice(lead.price)} />
            </div>
          </div>

          {/* Seller Profile */}
          {lead.seller_profile && (
            <div className="surface-subtle rounded-2xl p-6">
              <SectionHeader 
                icon={User}
                title="Seller Profile"
                compact
              />
              <p className="text-sm text-white/70 leading-relaxed">{lead.seller_profile}</p>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="surface-subtle rounded-2xl p-6">
              <SectionHeader 
                icon={Edit3}
                title="Notes"
                compact
              />
              <p className="text-sm text-white/70 leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Drawer */}
      {editedLead && (
        <EditDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => {
            setIsEditDrawerOpen(false);
            setEditedLead(null);
          }}
          title="Edit Seller"
          subtitle={`Editing ${lead.owner_name}`}
          onSave={async () => {
            setIsSaving(true);
            // Simulate API call - in production, this would call your backend
            await new Promise(resolve => setTimeout(resolve, 500));
            setLead(editedLead);
            setIsSaving(false);
            setIsEditDrawerOpen(false);
          }}
          isSaving={isSaving}
        >
          <SellerEditPanel
            seller={editedLead}
            onChange={setEditedLead}
          />
        </EditDrawer>
      )}
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

function InsightCard({ 
  label, 
  value, 
  icon: Icon,
  color 
}: { 
  label: string; 
  value: string; 
  icon: React.ElementType;
  color: 'neutral' | 'positive' | 'warning';
}) {
  const colors = {
    neutral: 'bg-white/[0.04] text-white/80 border-white/[0.06]',
    positive: 'bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/[0.08] text-amber-400 border-amber-500/20',
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

function TimingBadge({ timing }: { timing: string }) {
  const colors: Record<string, string> = {
    immediate: 'bg-red-500/20 text-red-400',
    today: 'bg-orange-500/20 text-orange-400',
    tomorrow: 'bg-amber-500/20 text-amber-400',
    this_week: 'bg-blue-500/20 text-blue-400',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${colors[timing] || 'bg-white/[0.06] text-white/60'}`}>
      <Clock className="w-3 h-3 inline mr-1" />
      {timing.replace('_', ' ')}
    </span>
  );
}

function ToneBadge({ tone }: { tone: string }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.06] text-white/60">
      Tone: {tone}
    </span>
  );
}

function SignalsCard({ 
  title, 
  icon: Icon, 
  iconColor,
  signals 
}: { 
  title: string; 
  icon: React.ElementType; 
  iconColor: string;
  signals: string[];
}) {
  return (
    <div className="surface-subtle rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <ul className="space-y-2">
        {signals.map((signal, i) => (
          <li key={i} className="text-sm text-white/60 flex items-start gap-2">
            <span className={`${iconColor} opacity-50 mt-0.5`}>·</span>
            {signal}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-white/30" />
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-white">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="text-center py-12 text-white/30 surface-subtle rounded-xl">
      <Icon className="w-8 h-8 mx-auto mb-3 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
