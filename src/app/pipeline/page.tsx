"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Plus, 
  AlertTriangle,
  Clock,
  TrendingDown,
  Target,
  ChevronRight,
  Phone,
  Mail,
  FileSignature
} from "lucide-react";
import { getLeads } from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { Lead, LeadStatus } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";

const stages: { id: LeadStatus; name: string; description: string }[] = [
  { id: "new", name: "New", description: "Fresh leads" },
  { id: "qualified", name: "Qualified", description: "Validated interest" },
  { id: "contacted", name: "Contacted", description: "Initial outreach" },
  { id: "replied", name: "Replied", description: "Engaged" },
  { id: "call_scheduled", name: "Meeting", description: "Scheduled" },
  { id: "mandate_proposed", name: "Proposal", description: "Awaiting response" },
  { id: "mandate_sent", name: "Sent", description: "Document out" },
  { id: "mandate_signed", name: "Signed", description: "Won" },
  { id: "lost", name: "Lost", description: "Closed" },
];

export default function PipelinePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [intelligence, setIntelligence] = useState<Record<string, SellerIntelligence>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const leadsData = await getLeads();
      setLeads(leadsData);
      
      const intelMap: Record<string, SellerIntelligence> = {};
      for (const lead of leadsData) {
        const intel = await getLeadIntelligence(lead.id, lead);
        intelMap[lead.id] = intel;
      }
      setIntelligence(intelMap);
      setLoading(false);
    }
    loadData();
  }, []);

  // Bottlenecks
  const stuckProposals = leads.filter(l => l.status === 'mandate_proposed').length;
  const stuckSent = leads.filter(l => l.status === 'mandate_sent').length;
  const staleDeals = leads.filter(l => {
    const daysSince = Math.floor((Date.now() - new Date(l.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince > 7 && !['mandate_signed', 'lost'].includes(l.status);
  }).length;

  const activePipeline = leads.filter(l => !['mandate_signed', 'lost'].includes(l.status));
  const pipelineValue = activePipeline.reduce((acc, l) => acc + l.price, 0);
  const wonDeals = leads.filter(l => l.status === 'mandate_signed');

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `€${(price / 1000000).toFixed(1)}M`;
    return `€${(price / 1000).toFixed(0)}K`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-white/40 mt-1">Deal flow management</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
      </div>

      {/* BOTTLENECKS ALERTS */}
      {(stuckProposals > 0 || stuckSent > 0 || staleDeals > 0) && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/[0.08] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-sm font-medium text-amber-400/80">Attention Required</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stuckProposals > 0 && (
              <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-amber-400/50">
                <p className="text-2xl font-semibold">{stuckProposals}</p>
                <p className="text-sm text-white/50">Proposals awaiting response</p>
              </div>
            )}
            {stuckSent > 0 && (
              <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-amber-400/50">
                <p className="text-2xl font-semibold">{stuckSent}</p>
                <p className="text-sm text-white/50">Mandates sent, not signed</p>
              </div>
            )}
            {staleDeals > 0 && (
              <div className="p-4 surface-elevated rounded-xl border-l-2 border-l-red-400/50">
                <p className="text-2xl font-semibold">{staleDeals}</p>
                <p className="text-sm text-white/50">Deals stale (7+ days)</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* PIPELINE SUMMARY */}
      <section className="mb-8">
        <div className="flex items-center gap-8 p-6 surface-elevated rounded-2xl">
          <div>
            <p className="text-sm text-white/40 mb-1">Active Pipeline</p>
            <p className="text-3xl font-semibold">{formatPrice(pipelineValue)}</p>
            <p className="text-sm text-white/40 mt-1">{activePipeline.length} deals</p>
          </div>
          <div className="w-px h-16 bg-white/[0.08]" />
          <div>
            <p className="text-sm text-white/40 mb-1">Won This Month</p>
            <p className="text-3xl font-semibold text-emerald-400">{wonDeals.length}</p>
            <p className="text-sm text-white/40 mt-1">
              {leads.length > 0 ? Math.round((wonDeals.length / leads.length) * 100) : 0}% conversion
            </p>
          </div>
          <div className="flex-1" />
          <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
            <Target className="w-4 h-4" />
            Pipeline Report
          </Button>
        </div>
      </section>

      {/* KANBAN BOARD */}
      <section>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = leads.filter(l => l.status === stage.id);
            const stageValue = stageLeads.reduce((acc, l) => acc + l.price, 0);
            
            return (
              <div key={stage.id} className="w-72 shrink-0">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <h3 className="font-medium">{stage.name}</h3>
                    <p className="text-xs text-white/40">{stage.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">{stageLeads.length}</span>
                    {stageLeads.length > 0 && (
                      <p className="text-xs text-white/30">{formatPrice(stageValue)}</p>
                    )}
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {stageLeads.map((lead) => {
                    const intel = intelligence[lead.id];
                    return (
                      <div 
                        key={lead.id}
                        className="p-4 surface-subtle rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm">{lead.owner_name}</p>
                          <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
                        </div>
                        
                        <p className="text-xs text-white/40 mb-3">
                          {lead.property_type} · {lead.city}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{formatPrice(lead.price)}</p>
                          
                          {intel && intel.mandate_readiness_score > 50 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-400 rounded-full"
                                  style={{ width: `${intel.mandate_readiness_score}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-white/[0.06]" onClick={(e) => e.stopPropagation()}>
                            <Phone className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-white/[0.06]" onClick={(e) => e.stopPropagation()}>
                            <Mail className="w-3.5 h-3.5" />
                          </Button>
                          <div className="flex-1" />
                          <span className="text-[10px] text-white/30 uppercase">{lead.language_preference}</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {stageLeads.length === 0 && (
                    <div className="p-6 text-center border border-dashed border-white/[0.06] rounded-xl">
                      <p className="text-xs text-white/20">No leads</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
