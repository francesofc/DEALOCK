"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  Phone, 
  Mail, 
  Clock,
  Flame,
  AlertTriangle,
  TrendingDown,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Lead, LeadStatus } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";

// ============================================
// TYPES
// ============================================

interface EnhancedKanbanProps {
  leads: Lead[];
  intelligence: Record<string, SellerIntelligence>;
  stages: { id: LeadStatus; name: string; description: string }[];
  onLeadClick: (leadId: string) => void;
}

// ============================================
// ENHANCED KANBAN COMPONENT
// ============================================

export function EnhancedKanban({ leads, intelligence, stages, onLeadClick }: EnhancedKanbanProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{stage.name}</h3>
                    {getStageUrgency(stage.id, stageLeads) && (
                      <span className={`w-2 h-2 rounded-full ${getStageUrgency(stage.id, stageLeads)}`} />
                    )}
                  </div>
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
                {stageLeads.map((lead) => (
                  <EnhancedCard
                    key={lead.id}
                    lead={lead}
                    intel={intelligence[lead.id]}
                    isHovered={hoveredCard === lead.id}
                    onHover={() => setHoveredCard(lead.id)}
                    onLeave={() => setHoveredCard(null)}
                    onClick={() => onLeadClick(lead.id)}
                  />
                ))}
                
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
  );
}

// ============================================
// ENHANCED CARD COMPONENT
// ============================================

interface EnhancedCardProps {
  lead: Lead;
  intel?: SellerIntelligence;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

function EnhancedCard({ lead, intel, isHovered, onHover, onLeave, onClick }: EnhancedCardProps) {
  const daysInStage = getDaysInStage(lead);
  const badges = getCardBadges(lead, intel, daysInStage);
  
  return (
    <div 
      className={`p-4 surface-subtle rounded-xl transition-all cursor-pointer group relative overflow-hidden ${
        isHovered ? 'bg-white/[0.06] scale-[1.02]' : ''
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Priority indicator stripe */}
      {badges.priority && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${badges.priorityColor}`} />
      )}
      
      <div className={badges.priority ? 'pl-2' : ''}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <p className="font-medium text-sm truncate pr-2">{lead.owner_name}</p>
          <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors shrink-0" />
        </div>
        
        {/* Property info */}
        <p className="text-xs text-white/40 mb-2">
          {lead.property_type} · {lead.city}
        </p>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {badges.hot && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[10px] font-medium flex items-center gap-1">
              <Flame className="w-3 h-3" />
              HOT
            </span>
          )}
          {badges.stale && (
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 text-[10px] flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              {daysInStage}d
            </span>
          )}
          {badges.highValue && (
            <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 text-[10px] font-medium flex items-center gap-1">
              <Target className="w-3 h-3" />
              HIGH
            </span>
          )}
          {badges.urgent && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              ACT
            </span>
          )}
        </div>
        
        {/* Value and readiness */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{formatPrice(lead.price)}</p>
          
          {intel && intel.mandate_readiness_score > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    intel.mandate_readiness_score > 70 ? 'bg-emerald-400' : 
                    intel.mandate_readiness_score > 40 ? 'bg-amber-400' : 'bg-white/30'
                  }`}
                  style={{ width: `${intel.mandate_readiness_score}%` }}
                />
              </div>
              <span className="text-[10px] text-white/40">{intel.mandate_readiness_score}%</span>
            </div>
          )}
        </div>
        
        {/* Days indicator */}
        {daysInStage > 3 && !badges.stale && (
          <div className="flex items-center gap-1 mt-2 text-[10px] text-white/30">
            <Clock className="w-3 h-3" />
            <span>{daysInStage} days in stage</span>
          </div>
        )}
        
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
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCardBadges(lead: Lead, intel?: SellerIntelligence, daysInStage: number = 0) {
  const isHot = intel && intel.mandate_readiness_score > 70 && ['replied', 'call_scheduled'].includes(lead.status);
  const isStale = daysInStage > 7;
  const isHighValue = lead.price > 500000; // Could be dynamic based on portfolio
  const isUrgent = lead.status === 'new' || (['mandate_proposed', 'mandate_sent'].includes(lead.status) && daysInStage > 3);
  
  let priority = false;
  let priorityColor = '';
  
  if (isHot) {
    priority = true;
    priorityColor = 'bg-red-400';
  } else if (isUrgent) {
    priority = true;
    priorityColor = 'bg-amber-400';
  } else if (isStale) {
    priority = true;
    priorityColor = 'bg-white/20';
  }
  
  return {
    hot: isHot,
    stale: isStale,
    highValue: isHighValue,
    urgent: isUrgent,
    priority,
    priorityColor
  };
}

function getStageUrgency(stageId: LeadStatus, leads: Lead[]): string | null {
  // Check if stage has urgent items
  const hasUrgent = leads.some(l => {
    const days = getDaysInStage(l);
    return l.status === 'new' || (['mandate_proposed', 'mandate_sent'].includes(l.status) && days > 3);
  });
  
  if (hasUrgent) return 'bg-red-400';
  
  const hasStale = leads.some(l => getDaysInStage(l) > 7);
  if (hasStale) return 'bg-white/20';
  
  return null;
}

function getDaysInStage(lead: Lead): number {
  const updated = new Date(lead.updated_at);
  const now = new Date();
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `€${(price / 1000000).toFixed(1)}M`;
  return `€${(price / 1000).toFixed(0)}K`;
}
