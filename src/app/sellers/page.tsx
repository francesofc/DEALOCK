"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  Filter, 
  Sparkles,
  ChevronRight,
  Target,
  Building2,
  Zap,
  AlertCircle,
  TrendingUp,
  FileSignature,
  Clock,
  Flame,
  ArrowRight,
  MapPin
} from "lucide-react";
import { getLeads } from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { Lead, LeadStatus } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";
import { useTranslation } from "@/lib/i18n";

// ============================================
// SELLER STATUS DEFINITIONS
// ============================================

const statusMap: Record<LeadStatus, { 
  label: string; 
  className: string;
  stage: 'early' | 'developing' | 'closing' | 'closed' | 'lost';
}> = {
  new: { label: "New", className: "bg-white/[0.06] text-white/60", stage: 'early' },
  qualified: { label: "Qualified", className: "bg-emerald-500/15 text-emerald-400", stage: 'early' },
  contacted: { label: "Contacted", className: "bg-amber-500/15 text-amber-400", stage: 'developing' },
  replied: { label: "Replied", className: "bg-blue-500/15 text-blue-400", stage: 'developing' },
  call_scheduled: { label: "Meeting", className: "bg-violet-500/15 text-violet-400", stage: 'developing' },
  mandate_proposed: { label: "Proposal", className: "bg-orange-500/15 text-orange-400", stage: 'closing' },
  mandate_sent: { label: "Sent", className: "bg-cyan-500/15 text-cyan-400", stage: 'closing' },
  mandate_signed: { label: "Signed", className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", stage: 'closed' },
  lost: { label: "Lost", className: "bg-red-500/15 text-red-400", stage: 'lost' },
};

// ============================================
// URGENCY CALCULATION
// ============================================

type UrgencyLevel = 'critical' | 'high' | 'normal' | 'low';

interface UrgencyInfo {
  level: UrgencyLevel;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  reason: string;
}

function getUrgency(lead: Lead, intel: SellerIntelligence | undefined): UrgencyInfo {
  if (!intel) {
    return {
      level: 'low',
      label: 'Analyzing',
      icon: Clock,
      color: 'text-white/40',
      bg: 'bg-white/[0.04]',
      border: 'border-white/[0.06]',
      reason: 'Waiting for intelligence'
    };
  }
  
  // Critical: mandate in closing stage with high readiness
  if (['mandate_proposed', 'mandate_sent'].includes(lead.status) && intel.mandate_readiness_score > 70) {
    return {
      level: 'critical',
      label: 'Closing',
      icon: Flame,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-l-2 border-l-red-400',
      reason: 'Mandate ready - act today'
    };
  }
  
  // High: near-mandate with good engagement
  if (['replied', 'call_scheduled'].includes(lead.status) && intel.mandate_readiness_score > 60) {
    return {
      level: 'high',
      label: 'Near Mandate',
      icon: Zap,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-l-2 border-l-orange-400',
      reason: 'High conversion potential'
    };
  }
  
  // High: high priority score
  if ((lead.priority_score || 0) > 0.8 && lead.status !== 'mandate_signed') {
    return {
      level: 'high',
      label: 'High Value',
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-l-2 border-l-amber-400',
      reason: 'Premium property / motivated seller'
    };
  }
  
  // Normal: engaged but earlier stage
  if (['contacted', 'replied', 'call_scheduled'].includes(lead.status)) {
    return {
      level: 'normal',
      label: 'Developing',
      icon: ArrowRight,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-l-2 border-l-blue-400',
      reason: 'Building relationship'
    };
  }
  
  // Low: new or early stage
  return {
    level: 'low',
    label: 'Nurture',
    icon: Clock,
    color: 'text-white/40',
    bg: 'bg-white/[0.04]',
    border: 'border-l-2 border-l-white/10',
    reason: 'Early stage - steady follow-up'
  };
}

// ============================================
// READINESS BAR COMPONENT
// ============================================

function ReadinessBar({ score }: { score: number }) {
  let colorClass = 'bg-white/30';
  let label = 'Early';
  
  if (score > 70) {
    colorClass = 'bg-emerald-400';
    label = 'Near Mandate';
  } else if (score > 40) {
    colorClass = 'bg-amber-400';
    label = 'Developing';
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/40">Readiness</span>
        <span className={`text-xs font-medium ${score > 70 ? 'text-emerald-400' : score > 40 ? 'text-amber-400' : 'text-white/50'}`}>
          {score}%
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} rounded-full transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-white/30 mt-1">{label}</p>
    </div>
  );
}

export default function SellersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [intelligence, setIntelligence] = useState<Record<string, SellerIntelligence>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      const data = await getLeads();
      setLeads(data);
      
      const intelMap: Record<string, SellerIntelligence> = {};
      for (const lead of data) {
        const intel = await getLeadIntelligence(lead.id, lead);
        intelMap[lead.id] = intel;
      }
      setIntelligence(intelMap);
      setLoading(false);
    }
    loadLeads();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate stats
  const stats = {
    total: leads.length,
    critical: leads.filter(l => {
      const intel = intelligence[l.id];
      return ['mandate_proposed', 'mandate_sent'].includes(l.status) && (intel?.mandate_readiness_score || 0) > 70;
    }).length,
    nearMandate: leads.filter(l => {
      const intel = intelligence[l.id];
      return ['replied', 'call_scheduled'].includes(l.status) && (intel?.mandate_readiness_score || 0) > 60;
    }).length,
    proposalOut: leads.filter(l => ['mandate_proposed', 'mandate_sent'].includes(l.status)).length,
    signed: leads.filter(l => l.status === 'mandate_signed').length,
  };

  // Sort by urgency then readiness
  const sortedLeads = [...leads].sort((a, b) => {
    const aIntel = intelligence[a.id];
    const bIntel = intelligence[b.id];
    const aUrgency = getUrgency(a, aIntel);
    const bUrgency = getUrgency(b, bIntel);
    
    const urgencyOrder: Record<UrgencyLevel, number> = { critical: 3, high: 2, normal: 1, low: 0 };
    if (urgencyOrder[aUrgency.level] !== urgencyOrder[bUrgency.level]) {
      return urgencyOrder[bUrgency.level] - urgencyOrder[aUrgency.level];
    }
    
    return (bIntel?.mandate_readiness_score || 0) - (aIntel?.mandate_readiness_score || 0);
  });

  // Group by urgency for visual separation
  const criticalLeads = sortedLeads.filter(l => getUrgency(l, intelligence[l.id]).level === 'critical');
  const highLeads = sortedLeads.filter(l => getUrgency(l, intelligence[l.id]).level === 'high');
  const normalLeads = sortedLeads.filter(l => getUrgency(l, intelligence[l.id]).level === 'normal');
  const lowLeads = sortedLeads.filter(l => getUrgency(l, intelligence[l.id]).level === 'low');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading your pipeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.leads.title}</h1>
          <p className="text-white/40 mt-1">{t.leads.subtitle}</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          {t.common.create}
        </Button>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard icon={Target} value={stats.total} label={t.leads.stats.total} />
        <StatCard icon={Flame} value={stats.critical} label={t.leads.stats.critical} color="red" />
        <StatCard icon={Zap} value={stats.nearMandate} label={t.leads.stats.near_mandate} color="orange" />
        <StatCard icon={FileSignature} value={stats.proposalOut} label={t.leads.stats.proposal_out} color="amber" />
        <StatCard icon={CheckIcon} value={stats.signed} label={t.leads.stats.signed} color="emerald" />
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder={t.leads.search_placeholder}
            className="pl-11 bg-white/[0.03] border-white/[0.06] focus:border-white/10"
          />
        </div>
        <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
          <Filter className="w-4 h-4" />
          {t.common.filter}
        </Button>
      </div>

      {/* SELLERS LIST - GROUPED BY URGENCY */}
      <div className="space-y-6">
        
        {/* CRITICAL */}
        {criticalLeads.length > 0 && (
          <section>
            <UrgencyHeader 
              icon={Flame} 
              title={t.leads.priorities.critical_now} 
              count={criticalLeads.length}
              color="red"
            />
            <div className="space-y-2">
              {criticalLeads.map(lead => (
                <SellerRow 
                  key={lead.id} 
                  lead={lead} 
                  intel={intelligence[lead.id]}
                  onClick={() => router.push(`/sellers/${lead.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* HIGH PRIORITY */}
        {highLeads.length > 0 && (
          <section>
            <UrgencyHeader 
              icon={Zap} 
              title={t.leads.priorities.high_priority} 
              count={highLeads.length}
              color="orange"
            />
            <div className="space-y-2">
              {highLeads.map(lead => (
                <SellerRow 
                  key={lead.id} 
                  lead={lead} 
                  intel={intelligence[lead.id]}
                  onClick={() => router.push(`/sellers/${lead.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* DEVELOPING */}
        {normalLeads.length > 0 && (
          <section>
            <UrgencyHeader 
              icon={ArrowRight} 
              title={t.leads.priorities.developing} 
              count={normalLeads.length}
              color="blue"
            />
            <div className="space-y-2">
              {normalLeads.slice(0, 5).map(lead => (
                <SellerRow 
                  key={lead.id} 
                  lead={lead} 
                  intel={intelligence[lead.id]}
                  onClick={() => router.push(`/sellers/${lead.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* NURTURE */}
        {lowLeads.length > 0 && (
          <section className="opacity-70">
            <UrgencyHeader 
              icon={Clock} 
              title="Nurture" 
              count={lowLeads.length}
              color="default"
            />
            <div className="space-y-2">
              {lowLeads.slice(0, 3).map(lead => (
                <SellerRow 
                  key={lead.id} 
                  lead={lead} 
                  intel={intelligence[lead.id]}
                  onClick={() => router.push(`/sellers/${lead.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* EMPTY STATE */}
      {leads.length === 0 && (
        <div className="text-center py-20 surface-subtle rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-medium mb-2">No sellers yet</h3>
          <p className="text-white/40 text-sm mb-6">Start building your pipeline</p>
          <Button className="gap-2 bg-white text-black hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Add Your First Seller
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// SELLER ROW COMPONENT
// ============================================

function SellerRow({ 
  lead, 
  intel, 
  onClick 
}: { 
  lead: Lead; 
  intel: SellerIntelligence | undefined;
  onClick: () => void;
}) {
  const router = useRouter();
  const status = statusMap[lead.status];
  const urgency = getUrgency(lead, intel);
  const UrgencyIcon = urgency.icon;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <div 
      className={`group p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer ${urgency.border}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Urgency Indicator */}
        <div className={`w-10 h-10 rounded-xl ${urgency.bg} flex items-center justify-center shrink-0`}>
          <UrgencyIcon className={`w-5 h-5 ${urgency.color}`} />
        </div>
        
        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{lead.owner_name}</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${status.className}`}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-white/40">
            <Building2 className="w-3.5 h-3.5" />
            <span>{lead.property_type}</span>
            <span className="text-white/20">·</span>
            <MapPin className="w-3.5 h-3.5" />
            <span>{lead.city}</span>
          </div>
        </div>

        {/* Next Action */}
        <div className="w-48 shrink-0 hidden md:block">
          {intel ? (
            <ReadinessBar score={intel.mandate_readiness_score} />
          ) : (
            <span className="text-xs text-white/30">Analyzing...</span>
          )}
        </div>

        {/* Value */}
        <div className="w-24 text-right shrink-0">
          <p className="font-medium">{formatPrice(lead.price)}</p>
          {lead.priority_score && lead.priority_score > 0.7 && (
            <p className="text-xs text-amber-400">High priority</p>
          )}
        </div>

        {/* Action */}
        <div className="w-28 shrink-0 flex justify-end">
          <Button 
            size="sm" 
            variant="ghost" 
            className="gap-1.5 text-white/50 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            View
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Next Action Preview (Mobile) */}
      {intel && (
        <div className="mt-3 pt-3 border-t border-white/[0.04] md:hidden">
          <p className="text-sm text-white/50">
            <span className="text-white/30">Next:</span> {intel.next_best_move.replace(/_/g, ' ')}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color = 'default'
}: { 
  icon: React.ElementType; 
  value: number; 
  label: string; 
  color?: 'default' | 'red' | 'orange' | 'amber' | 'emerald';
}) {
  const colors = {
    default: "bg-white/[0.06] text-white/60",
    red: "bg-red-500/10 text-red-400",
    orange: "bg-orange-500/10 text-orange-400",
    amber: "bg-amber-500/10 text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
  };
  
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function UrgencyHeader({ 
  icon: Icon, 
  title, 
  count,
  color
}: { 
  icon: React.ElementType; 
  title: string; 
  count: number;
  color: 'red' | 'orange' | 'blue' | 'default';
}) {
  const colors = {
    red: "text-red-400",
    orange: "text-orange-400",
    blue: "text-blue-400",
    default: "text-white/50",
  };
  
  return (
    <div className="flex items-center gap-3 mb-3">
      <Icon className={`w-4 h-4 ${colors[color]}`} />
      <h3 className={`font-medium ${colors[color]}`}>{title}</h3>
      <span className="text-sm text-white/30">({count})</span>
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
