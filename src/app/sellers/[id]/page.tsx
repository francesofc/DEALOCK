"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Shield,
  Zap,
  User,
  AlertCircle,
  ChevronRight,
  Building2,
  Euro,
  Maximize,
  BedDouble
} from "lucide-react";
import Link from "next/link";
import { getLeadById, getActivitiesByLeadId, getMandateByLeadId } from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { Lead, Activity, Mandate, LeadStatus, MandateStatus, ActivityType } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";

const statusMap: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-white/10 text-white/70" },
  qualified: { label: "Qualified", color: "bg-emerald-500/20 text-emerald-400" },
  contacted: { label: "Contacted", color: "bg-amber-500/20 text-amber-400" },
  replied: { label: "Replied", color: "bg-blue-500/20 text-blue-400" },
  call_scheduled: { label: "Meeting Set", color: "bg-violet-500/20 text-violet-400" },
  mandate_proposed: { label: "Proposal Out", color: "bg-orange-500/20 text-orange-400" },
  mandate_sent: { label: "Sent", color: "bg-cyan-500/20 text-cyan-400" },
  mandate_signed: { label: "Signed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  lost: { label: "Lost", color: "bg-red-500/20 text-red-400" },
};

const mandateStatusMap: Record<MandateStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-white/10 text-white/70" },
  sent: { label: "Sent", color: "bg-cyan-500/20 text-cyan-400" },
  signed: { label: "Signed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  expired: { label: "Expired", color: "bg-amber-500/20 text-amber-400" },
  terminated: { label: "Terminated", color: "bg-red-500/20 text-red-400" },
};

const activityTypeMap: Record<ActivityType, { label: string; icon: string }> = {
  call: { label: "Call", icon: "phone" },
  email: { label: "Email", icon: "mail" },
  whatsapp: { label: "WhatsApp", icon: "message" },
  meeting: { label: "Meeting", icon: "calendar" },
  note: { label: "Note", icon: "file-text" },
  mandate: { label: "Mandate", icon: "file-signature" },
  lead: { label: "Lead", icon: "user" },
  buyer: { label: "Buyer", icon: "users" },
  match: { label: "Match", icon: "puzzle" },
  finance: { label: "Finance", icon: "wallet" },
};

const formatMindset = (mindset: string) => {
  return mindset.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export default function SellerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mandate, setMandate] = useState<Mandate | null>(null);
  const [intelligence, setIntelligence] = useState<SellerIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Analyzing lead profile...</p>
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
            Back to Sellers
          </Button>
        </Link>
      </div>
    );
  }

  const status = statusMap[lead.status];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/sellers">
          <Button variant="ghost" size="sm" className="gap-2 text-white/60 hover:text-white hover:bg-white/[0.04]">
            <ArrowLeft className="w-4 h-4" />
            Back to Sellers
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/[0.04]">
          <Sparkles className="w-4 h-4" />
          Refresh Analysis
        </Button>
      </div>

      {/* HERO STRIP */}
      <section className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          {/* Left: Identity */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
              <span className="text-white/40 text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                {lead.language_preference.toUpperCase()}
              </span>
            </div>
            
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              {lead.owner_name}
            </h1>
            <p className="text-lg text-white/60">
              {lead.property_type} <span className="text-white/30">·</span> {lead.neighborhood}, {lead.city}
            </p>
          </div>

          {/* Right: Value & Readiness */}
          <div className="flex items-center gap-8 lg:text-right">
            <div>
              <p className="text-sm text-white/40 mb-1">Property Value</p>
              <p className="text-3xl font-semibold tracking-tight">{formatPrice(lead.price)}</p>
              <p className="text-sm text-white/50 mt-1">{lead.area_m2}m² · {lead.bedrooms || 0} bed</p>
            </div>
            
            {intelligence && (
              <div className="pl-8 border-l border-white/[0.08]">
                <p className="text-sm text-white/40 mb-2">Mandate Readiness</p>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${intelligence.mandate_readiness_score}%` }}
                    />
                  </div>
                  <span className="text-2xl font-semibold">{intelligence.mandate_readiness_score}%</span>
                </div>
                {intelligence.estimated_days_to_mandate && (
                  <p className="text-xs text-white/40 mt-1.5">
                    ~{intelligence.estimated_days_to_mandate} days to close
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/[0.06]">
          <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
            <Phone className="w-4 h-4" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </Button>
          <div className="flex-1" />
          <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90">
            <FileSignature className="w-4 h-4" />
            Propose Mandate
          </Button>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Strategic Intelligence */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Seller Intelligence Panel */}
          {intelligence && (
            <section className="surface-elevated rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Strategic Intelligence</h2>
                  <p className="text-sm text-white/40">AI-powered seller analysis</p>
                </div>
              </div>

              {/* Core Insights Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <InsightPill 
                  label="Mindset"
                  value={formatMindset(intelligence.seller_mindset)}
                  tone="neutral"
                />
                <InsightPill 
                  label="Relationship"
                  value={formatMindset(intelligence.relationship_state)}
                  tone={intelligence.relationship_state === 'cold' ? 'warning' : 'positive'}
                />
                <InsightPill 
                  label="Momentum"
                  value={formatMindset(intelligence.deal_momentum)}
                  tone={intelligence.deal_momentum === 'weak' || intelligence.deal_momentum === 'at_risk' ? 'warning' : 'positive'}
                />
                <InsightPill 
                  label="Approach"
                  value={formatMindset(intelligence.recommended_angle)}
                  tone="neutral"
                />
              </div>

              {/* Next Best Action */}
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Next Best Move</p>
                    <p className="text-xl font-medium mb-1">
                      {formatMindset(intelligence.next_best_move)}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-white/50">
                        Timing: <span className="text-white">{intelligence.suggested_timing}</span>
                      </span>
                      <span className="text-white/30">·</span>
                      <span className="text-white/50">
                        Tone: <span className="text-white">{formatMindset(intelligence.tone_to_use)}</span>
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90 shrink-0">
                    <Zap className="w-4 h-4" />
                    Execute
                  </Button>
                </div>
              </div>

              {/* Suggested Opening */}
              <div className="p-5 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-2">Suggested Opening</p>
                <p className="text-white/80 leading-relaxed">
                  "{intelligence.suggested_opening.replace('{city}', lead.city)}"
                </p>
              </div>

              {/* What to Avoid */}
              {intelligence.what_to_avoid.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">What to Avoid</p>
                  <div className="flex flex-wrap gap-2">
                    {intelligence.what_to_avoid.slice(0, 3).map((item, i) => (
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
                <div className="surface-subtle rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">Positive Signals</span>
                  </div>
                  <ul className="space-y-2">
                    {intelligence.positive_signals.map((signal, i) => (
                      <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                        <span className="text-emerald-400/50 mt-0.5">·</span>
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {intelligence.risk_signals.length > 0 && (
                <div className="surface-subtle rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium">Watch For</span>
                  </div>
                  <ul className="space-y-2">
                    {intelligence.risk_signals.map((signal, i) => (
                      <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                        <span className="text-amber-400/50 mt-0.5">·</span>
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Activity Timeline */}
          <section>
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Activity Timeline</h3>
            <div className="space-y-1">
              {activities.length > 0 ? (
                activities.map((activity, i) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="w-2 h-2 rounded-full bg-white/20 mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activityTypeMap[activity.type].label}</p>
                        <span className="text-xs text-white/30">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/50 mt-0.5">{activity.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-white/30">
                  <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No activity recorded yet</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Context & Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Mandate Status Card */}
          <div className="surface-elevated rounded-2xl p-6">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Mandate Status</h3>
            
            {mandate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${mandateStatusMap[mandate.status]?.color || mandateStatusMap.draft.color}`}>
                    {mandate.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Type</span>
                  <span className="text-white font-medium">
                    {mandate.exclusive ? 'Exclusive' : 'Non-Exclusive'}
                  </span>
                </div>
                
                {mandate.status === 'signed' && (
                  <Button className="w-full mt-2 gap-2 bg-white text-black hover:bg-white/90">
                    <Sparkles className="w-4 h-4" />
                    Activation Strategy
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
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
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Property</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-sm text-white/40">Type</p>
                  <p className="text-white">{lead.property_type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-sm text-white/40">Location</p>
                  <p className="text-white">{lead.city}</p>
                  <p className="text-sm text-white/40">{lead.neighborhood}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Maximize className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-sm text-white/40">Area</p>
                  <p className="text-white">{lead.area_m2} m²</p>
                </div>
              </div>
              
              {lead.bedrooms !== null && (
                <div className="flex items-center gap-3">
                  <BedDouble className="w-4 h-4 text-white/30" />
                  <div>
                    <p className="text-sm text-white/40">Bedrooms</p>
                    <p className="text-white">{lead.bedrooms}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seller Profile */}
          {lead.seller_profile && (
            <div className="surface-subtle rounded-2xl p-6">
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Seller Profile</h3>
              <p className="text-sm text-white/70 leading-relaxed">{lead.seller_profile}</p>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="surface-subtle rounded-2xl p-6">
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Notes</h3>
              <p className="text-sm text-white/70 leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components

function InsightPill({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'positive' | 'warning' }) {
  const toneStyles = {
    neutral: 'bg-white/[0.04] text-white/80',
    positive: 'bg-emerald-500/[0.08] text-emerald-400/80',
    warning: 'bg-amber-500/[0.08] text-amber-400/80',
  };

  return (
    <div className={`p-3 rounded-xl ${toneStyles[tone]}`}>
      <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
