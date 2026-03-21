"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Plus, 
  Search,
  Sparkles, 
  AlertTriangle,
  Clock,
  Target,
  ChevronRight,
  FileSignature,
  TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { getMandates, getLeads } from "@/lib/data";
import { Mandate, Lead, MandateStatus } from "@/types/database";

const statusMap: Record<MandateStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-white/[0.06] text-white/60" },
  sent: { label: "Pending", className: "bg-amber-500/15 text-amber-400" },
  signed: { label: "Active", className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" },
  expired: { label: "Expired", className: "bg-red-500/15 text-red-400" },
  terminated: { label: "Ended", className: "bg-white/[0.06] text-white/40" },
};

export default function MandatesPage() {
  const router = useRouter();
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [leads, setLeads] = useState<Record<string, Lead>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [mandatesData, leadsData] = await Promise.all([
        getMandates(),
        getLeads(),
      ]);
      setMandates(mandatesData);
      const leadsMap = leadsData.reduce((acc, lead) => {
        acc[lead.id] = lead;
        return acc;
      }, {} as Record<string, Lead>);
      setLeads(leadsMap);
      setLoading(false);
    }
    loadData();
  }, []);

  const activeMandates = mandates.filter(m => m.status === 'signed');
  const pendingMandates = mandates.filter(m => m.status === 'sent');
  const nonExclusive = activeMandates.filter(m => !m.exclusive);
  
  const totalValue = activeMandates.reduce((acc, m) => acc + (leads[m.lead_id]?.price || 0), 0);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `€${(price / 1000000).toFixed(1)}M`;
    return `€${(price / 1000).toFixed(0)}K`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading mandates...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mandates</h1>
          <p className="text-white/40 mt-1">Active exclusivity agreements</p>
        </div>
        <Button className="gap-2 bg-white text-black hover:bg-white/90">
          <Plus className="w-4 h-4" />
          New Mandate
        </Button>
      </div>

      {/* HERO STATS */}
      <section className="mb-8">
        <div className="p-8 surface-elevated rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40 mb-2">Portfolio Under Management</p>
              <p className="text-5xl font-semibold tracking-tight">{formatPrice(totalValue)}</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-white/60">{activeMandates.length} Active</span>
                </div>
                {nonExclusive.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-sm text-white/60">{nonExclusive.length} Non-Exclusive</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button className="gap-2 bg-white text-black hover:bg-white/90">
              <Sparkles className="w-4 h-4" />
              Generate Activation Strategy
            </Button>
          </div>
        </div>
      </section>

      {/* ALERTS */}
      {(pendingMandates.length > 0 || nonExclusive.length > 0) && (
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingMandates.length > 0 && (
              <div className="p-5 surface-elevated rounded-xl border-l-2 border-l-amber-400/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/[0.08] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">Pending Signatures</h3>
                    <p className="text-sm text-white/50 mb-3">
                      {pendingMandates.length} mandate{pendingMandates.length > 1 ? 's' : ''} awaiting client response
                    </p>
                    <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/[0.04]">
                      Follow Up
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {nonExclusive.length > 0 && (
              <div className="p-5 surface-elevated rounded-xl border-l-2 border-l-orange-400/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/[0.08] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">Non-Exclusive Mandates</h3>
                    <p className="text-sm text-white/50 mb-3">
                      {nonExclusive.length} active mandate{nonExclusive.length > 1 ? 's' : ''} without exclusivity
                    </p>
                    <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/[0.04]">
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ACTIVE MANDATES */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium">Active Mandates</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search mandates..."
              className="pl-10 w-64 bg-white/[0.03] border-white/[0.06]"
            />
          </div>
        </div>

        <div className="space-y-2">
          {mandates
            .filter(m => m.status === 'signed')
            .map((mandate) => {
              const lead = leads[mandate.lead_id];
              if (!lead) return null;
              
              return (
                <div 
                  key={mandate.id}
                  className="p-5 surface-subtle rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  onClick={() => router.push(`/leads/${mandate.lead_id}`)}
                >
                  <div className="flex items-center gap-6">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/[0.08] flex items-center justify-center shrink-0">
                      <FileSignature className="w-5 h-5 text-emerald-400" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{lead.owner_name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          mandate.exclusive 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {mandate.exclusive ? 'Exclusive' : 'Non-Exclusive'}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mt-1">
                        {lead.property_type} · {lead.city}
                      </p>
                    </div>

                    {/* Value */}
                    <div className="w-28 text-right">
                      <p className="font-medium">{formatPrice(lead.price)}</p>
                    </div>

                    {/* Action */}
                    <div className="w-40 shrink-0 flex justify-end">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="gap-2 text-white/50 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Strategy
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {activeMandates.length === 0 && (
          <div className="text-center py-16 surface-subtle rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-medium mb-2">No active mandates</h3>
            <p className="text-white/40 text-sm mb-6">Your signed mandates will appear here</p>
            <Button className="gap-2 bg-white text-black hover:bg-white/90">
              <Plus className="w-4 h-4" />
              Create First Mandate
            </Button>
          </div>
        )}
      </section>

      {/* ACTIVATION STRATEGY PREVIEW */}
      {activeMandates.length > 0 && (
        <section className="mt-8 pt-8 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-medium">Activation Intelligence</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 surface-subtle rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Target className="w-5 h-5 text-white/60" />
              </div>
              <h3 className="font-medium mb-2">Listing Positioning</h3>
              <p className="text-sm text-white/50">
                Premium market positioning with professional staging recommendations
              </p>
            </div>
            <div className="p-5 surface-subtle rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-white/60" />
              </div>
              <h3 className="font-medium mb-2">Go-to-Market</h3>
              <p className="text-sm text-white/50">
                Multi-channel launch strategy with optimal timing analysis
              </p>
            </div>
            <div className="p-5 surface-subtle rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-white/60" />
              </div>
              <h3 className="font-medium mb-2">Buyer Targeting</h3>
              <p className="text-sm text-white/50">
                Ideal buyer profile identification with targeted outreach plan
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
