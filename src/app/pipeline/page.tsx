"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus, MoreHorizontal, Phone, Mail } from "lucide-react";

const stages = [
  { id: "new", name: "New", color: "bg-neutral-500" },
  { id: "qualified", name: "Qualified", color: "bg-blue-500" },
  { id: "contacted", name: "Contacted", color: "bg-yellow-500" },
  { id: "replied", name: "Replied", color: "bg-purple-500" },
  { id: "call_scheduled", name: "Call Scheduled", color: "bg-pink-500" },
  { id: "mandate_proposed", name: "Mandate Proposed", color: "bg-orange-500" },
  { id: "mandate_sent", name: "Mandate Sent", color: "bg-cyan-500" },
  { id: "mandate_signed", name: "Mandate Signed", color: "bg-green-500" },
  { id: "lost", name: "Lost", color: "bg-red-500" },
];

const leads = [
  { id: "1", name: "Marie Dupont", stage: "mandate_signed", value: "€450,000" },
  { id: "2", name: "João Silva", stage: "mandate_proposed", value: "€320,000" },
  { id: "3", name: "Emma Johnson", stage: "call_scheduled", value: "€280,000" },
  { id: "4", name: "Carlos Mendes", stage: "replied", value: "€390,000" },
  { id: "5", name: "Sophie Martin", stage: "contacted", value: "€510,000" },
  { id: "6", name: "Lucas Pereira", stage: "qualified", value: "€245,000" },
  { id: "7", name: "Ana Costa", stage: "new", value: "€380,000" },
  { id: "8", name: "Pedro Santos", stage: "lost", value: "€420,000" },
];

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pipeline"
        description="Track your leads through the sales process"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        }
      />

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageLeads = leads.filter((lead) => lead.stage === stage.id);
            return (
              <div key={stage.id} className="w-72 flex-shrink-0">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="font-medium text-sm">{stage.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Stage Cards */}
                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{lead.name}</h4>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{lead.value}</p>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Phone className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Mail className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
