"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EditDrawer } from "@/components/ui/EditDrawer";
import { SellerCreatePanel } from "@/components/sellers/SellerCreatePanel";
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
import { getLeads, createLead, getMandates, updateLead } from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { Lead, LeadStatus, Mandate, MandateStatus } from "@/types/database";
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

// Mandate status override map for display purposes
const mandateDisplayMap: Record<MandateStatus, { status: LeadStatus; label: string; className: string }> = {
  draft: { status: 'mandate_proposed', label: 'Near Mandate', className: 'bg-orange-500/15 text-orange-400' },
  sent: { status: 'mandate_sent', label: 'Pending', className: 'bg-cyan-500/15 text-cyan-400' },
  signed: { status: 'mandate_signed', label: 'Signed', className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
  expired: { status: 'mandate_proposed', label: 'Expired', className: 'bg-red-500/15 text-red-400' },
  terminated: { status: 'mandate_proposed', label: 'Ended', className: 'bg-white/[0.06] text-white/40' },
};

// Compute display status based on mandate priority
function getDisplayStatus(lead: Lead, mandate: Mandate | undefined): { status: LeadStatus; label: string; className: string } {
  if (mandate) {
    return mandateDisplayMap[mandate.status];
  }
  return {
    status: lead.status,
    label: statusMap[lead.status].label,
    className: statusMap[lead.status].className
  };
}

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

function getUrgency(lead: Lead, mandate: Mandate | undefined, intel: SellerIntelligence | undefined): UrgencyInfo {
  const displayStatus = getDisplayStatus(lead, mandate).status;
  
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
  if (['mandate_proposed', 'mandate_sent'].includes(displayStatus) && intel.mandate_readiness_score > 70) {
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
  if (['replied', 'call_scheduled'].includes(displayStatus) && intel.mandate_readiness_score > 60) {
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
  if ((lead.priority_score || 0) > 0.8 && displayStatus !== 'mandate_signed') {
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
  
  // Signed mandates: show as closed/success
  if (displayStatus === 'mandate_signed') {
    return {
      level: 'low',
      label: 'Signed',
      icon: FileSignature,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-l-2 border-l-emerald-400',
      reason: 'Exclusivity secured'
    };
  }
  
  // Normal: engaged but earlier stage
  if (['contacted', 'replied', 'call_scheduled'].includes(displayStatus)) {
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
  const [mandates, setMandates] = useState<Record<string, Mandate>>({});
  const [intelligence, setIntelligence] = useState<Record<string, SellerIntelligence>>({});
  const [loading, setLoading] = useState(true);
  
  // Create drawer state
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [newLeadData, setNewLeadData] = useState<Partial<Lead>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Load data function - extracted for reuse
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Load both leads and mandates
      const [leadsData, mandatesData] = await Promise.all([
        getLeads(),
        getMandates(),
      ]);
      
      setLeads(leadsData);
      
      // Build mandateByLeadId map
      const mandateMap: Record<string, Mandate> = {};
      for (const mandate of mandatesData) {
        mandateMap[mandate.lead_id] = mandate;
      }
      setMandates(mandateMap);
      
      // Load intelligence for all leads in parallel
      const intelResults = await Promise.all(
        leadsData.map(async (lead) => {
          try {
            const intel = await getLeadIntelligence(lead.id, lead);
            return [lead.id, intel] as [string, SellerIntelligence];
          } catch (intelErr) {
            console.error(`Error loading intelligence for lead ${lead.id}:`, intelErr);
            return null;
          }
        })
      );
      const intelMap: Record<string, SellerIntelligence> = {};
      for (const result of intelResults) {
        if (result) {
          intelMap[result[0]] = result[1];
        }
      }
      setIntelligence(intelMap);
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh when page becomes visible (after navigating from Seller Detail)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Sellers page visible, refreshing data...');
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate stats using display status (respecting mandates)
  const stats = {
    total: leads.length,
    critical: leads.filter(l => {
      const mandate = mandates[l.id];
      const displayStatus = getDisplayStatus(l, mandate).status;
      const intel = intelligence[l.id];
      return ['mandate_proposed', 'mandate_sent'].includes(displayStatus) && (intel?.mandate_readiness_score || 0) > 70;
    }).length,
    nearMandate: leads.filter(l => {
      const mandate = mandates[l.id];
      const displayStatus = getDisplayStatus(l, mandate).status;
      const intel = intelligence[l.id];
      return ['replied', 'call_scheduled'].includes(displayStatus) && (intel?.mandate_readiness_score || 0) > 60;
    }).length,
    proposalOut: leads.filter(l => {
      const mandate = mandates[l.id];
      const displayStatus = getDisplayStatus(l, mandate).status;
      return ['mandate_proposed', 'mandate_sent'].includes(displayStatus);
    }).length,
    signed: leads.filter(l => {
      const mandate = mandates[l.id];
      const displayStatus = getDisplayStatus(l, mandate).status;
      return displayStatus === 'mandate_signed';
    }).length,
  };

  // Sort by urgency then readiness, then by created_at (newest first)
  const sortedLeads = [...leads].sort((a, b) => {
    const aMandate = mandates[a.id];
    const bMandate = mandates[b.id];
    const aDisplayStatus = getDisplayStatus(a, aMandate).status;
    const bDisplayStatus = getDisplayStatus(b, bMandate).status;
    
    // Priority: signed mandates first, then sent, then draft, then by readiness
    const statusPriority: Record<LeadStatus, number> = {
      mandate_signed: 5,
      mandate_sent: 4,
      mandate_proposed: 3,
      call_scheduled: 2,
      replied: 1,
      contacted: 0,
      qualified: -1,
      new: -2,
      lost: -3,
    };
    
    if (statusPriority[aDisplayStatus] !== statusPriority[bDisplayStatus]) {
      return statusPriority[bDisplayStatus] - statusPriority[aDisplayStatus];
    }
    
    const aIntel = intelligence[a.id];
    const bIntel = intelligence[b.id];
    
    // Then by readiness score
    if ((bIntel?.mandate_readiness_score || 0) !== (aIntel?.mandate_readiness_score || 0)) {
      return (bIntel?.mandate_readiness_score || 0) - (aIntel?.mandate_readiness_score || 0);
    }
    
    // Finally by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Group by display status for visual separation
  const criticalLeads = sortedLeads.filter(l => {
    const mandate = mandates[l.id];
    const intel = intelligence[l.id];
    return getUrgency(l, mandate, intel).level === 'critical';
  });
  const highLeads = sortedLeads.filter(l => {
    const mandate = mandates[l.id];
    const intel = intelligence[l.id];
    return getUrgency(l, mandate, intel).level === 'high';
  });
  const normalLeads = sortedLeads.filter(l => {
    const mandate = mandates[l.id];
    const intel = intelligence[l.id];
    return getUrgency(l, mandate, intel).level === 'normal';
  });
  const lowLeads = sortedLeads.filter(l => {
    const mandate = mandates[l.id];
    const intel = intelligence[l.id];
    return getUrgency(l, mandate, intel).level === 'low';
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]" data-testid="loading-spinner">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading your pipeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto" data-testid="sellers-page" data-page-ready="true">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.leads.title}</h1>
          <p className="text-white/40 mt-1">{t.leads.subtitle}</p>
        </div>
        <Button 
          className="gap-2 bg-white text-black hover:bg-white/90"
          onClick={() => setIsCreateDrawerOpen(true)}
        >
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
                  mandate={mandates[lead.id]}
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
                  mandate={mandates[lead.id]}
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
              {normalLeads.map(lead => (
                <SellerRow 
                  key={lead.id} 
                  lead={lead} 
                  intel={intelligence[lead.id]}
                  mandate={mandates[lead.id]}
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
              {lowLeads.map(lead => (
                <SellerRow 
                  key={lead.id} 
                  lead={lead} 
                  intel={intelligence[lead.id]}
                  mandate={mandates[lead.id]}
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
          <Button 
            className="gap-2 bg-white text-black hover:bg-white/90"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Your First Seller
          </Button>
        </div>
      )}

      {/* CREATE DRAWER */}
      <EditDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        title="Add New Seller"
        subtitle="Create a new seller lead in your pipeline"
        onSave={() => {
          setIsCreating(true);
          // Persist to Supabase (with localStorage fallback)
          setTimeout(() => {
            // Build the new lead with safe defaults - always create
            const newLead: Lead = {
              id: newLeadData.id || crypto.randomUUID(),
              created_at: newLeadData.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
              status: (newLeadData.status as LeadStatus) || 'new',
              seller_type: newLeadData.seller_type || 'owner',
              whatsapp_status: 'not_sent',
              language_preference: (newLeadData.language_preference as any) || 'en',
              owner_name: newLeadData.owner_name?.trim() || 'New Seller',
              phone: newLeadData.phone || '',
              email: newLeadData.email || '',
              property_type: newLeadData.property_type || 'apartment',
              price: newLeadData.price || 0,
              city: newLeadData.city || '',
              neighborhood: newLeadData.neighborhood || '',
              bedrooms: newLeadData.bedrooms || null,
              area_m2: newLeadData.area_m2 || null,
              seller_profile: newLeadData.seller_profile || null,
              source: newLeadData.source || '',
              notes: newLeadData.notes || null,
              listing_url: null,
              days_on_market_estimate: null,
              asking_vs_market_delta: null,
              photos_quality_score: null,
              description_quality_score: null,
              priority_score: null,
            };
            
            // Persist to Supabase (with localStorage fallback)
            createLead(newLead);
            
            // Update local state for immediate UI update
            setLeads(prevLeads => [newLead, ...prevLeads]);
            
            // Reset form and close drawer
            setIsCreating(false);
            setIsCreateDrawerOpen(false);
            setNewLeadData({});
          }, 500);
        }}
        isSaving={isCreating}
        saveLabel="Create Seller"
      >
        <SellerCreatePanel onChange={setNewLeadData} />
      </EditDrawer>
    </div>
  );
}

// ============================================
// SELLER ROW COMPONENT
// ============================================

function SellerRow({ 
  lead, 
  intel, 
  mandate,
  onClick 
}: { 
  lead: Lead; 
  intel: SellerIntelligence | undefined;
  mandate: Mandate | undefined;
  onClick: () => void;
}) {
  const router = useRouter();
  const displayStatus = getDisplayStatus(lead, mandate);
  const urgency = getUrgency(lead, mandate, intel);
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
      data-testid="seller-row"
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${displayStatus.className}`}>
              {displayStatus.label}
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
