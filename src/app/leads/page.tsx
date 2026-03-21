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
  Building2
} from "lucide-react";
import { getLeads } from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { Lead, LeadStatus } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";

const statusMap: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-white/[0.06] text-white/60" },
  qualified: { label: "Qualified", className: "bg-emerald-500/15 text-emerald-400" },
  contacted: { label: "Contacted", className: "bg-amber-500/15 text-amber-400" },
  replied: { label: "Replied", className: "bg-blue-500/15 text-blue-400" },
  call_scheduled: { label: "Meeting", className: "bg-violet-500/15 text-violet-400" },
  mandate_proposed: { label: "Proposal", className: "bg-orange-500/15 text-orange-400" },
  mandate_sent: { label: "Sent", className: "bg-cyan-500/15 text-cyan-400" },
  mandate_signed: { label: "Signed", className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" },
  lost: { label: "Lost", className: "bg-red-500/15 text-red-400" },
};

export default function LeadsPage() {
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
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seller Leads</h1>
          <p className="text-white/40 mt-1">{leads.length} leads in your pipeline</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
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

      {/* LEADS LIST */}
      <div className="space-y-2">
        {leads.map((lead) => {
          const status = statusMap[lead.status];
          const intel = intelligence[lead.id];
          
          return (
            <div 
              key={lead.id}
              className="group p-5 surface-subtle rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer"
              onClick={() => router.push(`/leads/${lead.id}`)}
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

                {/* Readiness */}
                <div className="w-40 shrink-0">
                  {intel ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-white/40">Mandate Ready</span>
                        <span className="text-xs font-medium">{intel.mandate_readiness_score}%</span>
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
                    </div>
                  ) : (
                    <span className="text-xs text-white/30">Analyzing...</span>
                  )}
                </div>

                {/* Value */}
                <div className="w-28 text-right shrink-0">
                  <p className="font-medium">{formatPrice(lead.price)}</p>
                </div>

                {/* Action */}
                <div className="w-32 shrink-0 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="gap-1.5 text-white/50 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/leads/${lead.id}`);
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
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-medium mb-2">No leads yet</h3>
          <p className="text-white/40 text-sm mb-6">Start building your pipeline</p>
          <Button className="gap-2 bg-white text-black hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Add Your First Lead
          </Button>
        </div>
      )}
    </div>
  );
}
