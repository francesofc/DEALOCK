"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Plus, Target } from "lucide-react";
import { getLeads } from "@/lib/data";
import { getLeadIntelligence } from "@/lib/intelligence/mock-intelligence";
import { Lead, LeadStatus } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";
import { 
  PortfolioSummary,
  HighValueDeals,
  ActionQueue,
  EnhancedKanban
} from "@/components/pipeline";

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

  const handleLeadClick = (leadId: string) => {
    router.push(`/sellers/${leadId}`);
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

      {/* PORTFOLIO INTELLIGENCE */}
      <section className="mb-8">
        <PortfolioSummary leads={leads} intelligence={intelligence} />
      </section>

      {/* INTELLIGENCE SECTIONS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ActionQueue 
          leads={leads} 
          intelligence={intelligence} 
          onLeadClick={handleLeadClick}
        />
        <HighValueDeals 
          leads={leads} 
          intelligence={intelligence} 
          onLeadClick={handleLeadClick}
        />
      </section>

      {/* ENHANCED KANBAN BOARD */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Pipeline Board</h2>
          <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/[0.04]">
            <Target className="w-4 h-4" />
            Pipeline Report
          </Button>
        </div>
        <EnhancedKanban 
          leads={leads}
          intelligence={intelligence}
          stages={stages}
          onLeadClick={handleLeadClick}
        />
      </section>
    </div>
  );
}
