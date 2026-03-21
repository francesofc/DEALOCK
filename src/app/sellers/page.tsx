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
  ArrowRight
} from "lucide-react";
import { getLeads } from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { Lead, LeadStatus } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";

// ============================================
// SELLER STATUS LOGIC
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

// Urgency calculation based on status + readiness
function getUrgency(lead: Lead, intel: SellerIntelligence | undefined): {
  level: 'critical' | 'high' | 'normal' | 'low';
  label: string;
  reason: string;
} {
  if (!intel) return { level: 'low', label: 'Analyzing', reason: 'Waiting for intelligence' };
  
  // Critical: mandate in closing stage with high readiness
  if (['mandate_proposed', 'mandate_sent'].includes(lead.status) && intel.mandate_readiness_score > 70) {
    return { level: 'critical', label: 'Closing Now', reason: 'Mandate ready - act today' };
  }
  
  // High: near-mandate with good engagement
  if (['replied', 'call_scheduled'].includes(lead.status) && intel.mandate_readiness_score > 60) {
    return { level: 'high', label: 'Near Mandate', reason: 'High conversion potential' };
  }
  
  // High: high priority score regardless of status
  if ((lead.priority_score || 0) > 0.8 && lead.status !== 'mandate_signed') {
    return { level: 'high', label: 'High Value', reason: 'Premium property / motivated seller' };
  }
  
  // Normal: engaged but earlier stage
  if (['contacted', 'replied', 'call_scheduled'].includes(lead.status)) {
    return { level: 'normal', label: 'Developing', reason: 'Building relationship' };
  }
  
  // Low: new or early stage
  return { level: 'low', label: 'Nurture', reason: 'Early stage - steady follow-up' };
}

export default function SellersPage() {
  const router = useRouter();
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

  // Calculate commercial stats
  const stats = {
    total: leads.length,
    urgent: leads.filter(l => {
      const intel = intelligence[l.id];
      const urgency = getUrgency(l, intel);
      return urgency.level === 'critical' || urgency.level === 'high';
    }).length,
    nearMandate: leads.filter(l => {
      const intel = intelligence[l.id];
      return ['replied', 'call_scheduled'].includes(l.status) && (intel?.mandate_readiness_score || 0) > 60;
    }).length,
    mandateProposed: leads.filter(l => ['mandate_proposed', 'mandate_sent'].includes(l.status)).length,
    signed: leads.filter(l => l.status === 'mandate_signed').length,
  };

  // Sort leads by urgency then by readiness
  const sortedLeads = [...leads].sort((a, b) => {
    const aIntel = intelligence[a.id];
    const bIntel = intelligence[b.id];
    const aUrgency = getUrgency(a, aIntel);
    const bUrgency = getUrgency(b, bIntel);
    
    const urgencyOrder = { critical: 3, high: 2, normal: 1, low: 0 };
    if (urgencyOrder[aUrgency.level] !== urgencyOrder[bUrgency.level]) {
      return urgencyOrder[bUrgency.level] - urgencyOrder[aUrgency.level];
    }
    
    return (bIntel?.mandate_readiness_score || 0) - (aIntel?.mandate_readiness_score || 0);
  });

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
          <h1 className="text-2xl font-semibold tracking-tight">Sellers</h1>
          <p className="text-white/40 mt-1">Commercial pipeline management</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          Add Seller
        </Button>
      </div>

      {/* COMMERCIAL SUMMARY STRIP */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <SummaryCard 
          icon={Target} 
          value={stats.total} 
          label="Total Sellers" 
          color="default"
        />
        <SummaryCard 
          icon={Zap} 
          value={stats.urgent} 
          label="Urgent Actions" 
          color="red"
          pulse
        />
        <SummaryCard 
          icon={TrendingUp} 
          value={stats.nearMandate} 
          label="Near Mandate" 
          color="emerald"
        />
        <SummaryCard 
          icon={FileSignature} 
          value={stats.mandateProposed} 
          label="Proposal Out" 
          color="orange"
        />
        <SummaryCard 
          icon={CheckIcon} 
          value={stats.signed} 
          label="Signed" 
          color="violet"
        />
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search by name, city, or property..."
            className="pl-11 bg-white/[0.03] border-white/[0.06] focus:border-white/10"
          />
        </div>
        <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* SELLERS LIST */}
      <div className="space-y-2">
        {sortedLeads.map((lead) => {
          const status = statusMap[lead.status];
          const intel = intelligence[lead.id];
          const urgency = getUrgency(lead, intel);
          
          const urgencyColors = {
            critical: "border-l-2 border-l-red-400 bg-red-500/[0.02]",
            high: "border-l-2 border-l-orange-400 bg-orange-500/[0.02]",
            normal: "",
            low: "opacity-80",
          };
          
          return (
            <div 
              key={lead.id}
              className={`group p-5 surface-subtle rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer ${urgencyColors[urgency.level]}`}
              onClick={() => router.push(`/sellers/${lead.id}`)}
            >
              <div className="flex items-center gap-6">
                {/* Avatar / Type */}
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl shrink-0">
                  {lead.seller_type === 'owner' ? '🏠' : lead.seller_type === 'investor' ? '📈' : '🏗️'}
                </div>
                
                {/* Identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-medium truncate">{lead.owner_name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${status.className}`}>
                      {status.label}
                    </span>
                    {urgency.level === 'critical' && (
                      <Badge className="bg-red-500/20 text-red-400 border-0 text-[10px]">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {urgency.label}
                      </Badge>
                    )}
                    {urgency.level === 'high' && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-0 text-[10px]">
                        <Zap className="w-3 h-3 mr-1" />
                        {urgency.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-white/40">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{lead.property_type}</span>
                    <span className="text-white/20">·</span>
                    <span>{lead.city}</span>
                    <span className="text-white/20">·</span>
                    <span>{lead.language_preference.toUpperCase()}</span>
                  </div>
                </div>

                {/* Urgency / Next Action */}
                <div className="w-40 shrink-0">
                  {intel ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-white/40">Readiness</span>
                        <span className={`text-xs font-medium ${
                          intel.mandate_readiness_score > 70 ? 'text-emerald-400' :
                          intel.mandate_readiness_score > 40 ? 'text-amber-400' : 'text-white/50'
                        }`}>
                          {intel.mandate_readiness_score}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            intel.mandate_readiness_score > 70 ? 'bg-emerald-400' :
                            intel.mandate_readiness_score > 40 ? 'bg-amber-400' : 'bg-white/30'
                          }`}
                          style={{ width: `${intel.mandate_readiness_score}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/30 mt-1.5 truncate">
                        {intel.next_best_move.replace(/_/g, ' ')}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-white/30">Analyzing...</span>
                  )}
                </div>

                {/* Value */}
                <div className="w-28 text-right shrink-0">
                  <p className="font-medium">{formatPrice(lead.price)}</p>
                  {lead.priority_score && lead.priority_score > 0.7 && (
                    <p className="text-xs text-amber-400 mt-0.5">High priority</p>
                  )}
                </div>

                {/* Action */}
                <div className="w-32 shrink-0 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="gap-1.5 text-white/50 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/sellers/${lead.id}`);
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyze
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
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

// Helper Components

function SummaryCard({ 
  icon: Icon, 
  value, 
  label, 
  color,
  pulse = false
}: { 
  icon: React.ElementType; 
  value: number; 
  label: string; 
  color: 'default' | 'emerald' | 'violet' | 'orange' | 'red';
  pulse?: boolean;
}) {
  const colors = {
    default: "bg-white/[0.06] text-white/60",
    emerald: "bg-emerald-500/10 text-emerald-400",
    violet: "bg-violet-500/10 text-violet-400",
    orange: "bg-orange-500/10 text-orange-400",
    red: "bg-red-500/10 text-red-400",
  };
  
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2 ${pulse ? 'animate-pulse' : ''}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
