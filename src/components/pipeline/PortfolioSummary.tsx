"use client";

import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Target, 
  Zap,
  TrendingDown,
  CheckCircle2,
  Wallet
} from "lucide-react";
import { Lead, LeadStatus } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";

// ============================================
// TYPES
// ============================================

interface PortfolioSummaryProps {
  leads: Lead[];
  intelligence: Record<string, SellerIntelligence>;
}

export interface PortfolioMetrics {
  totalValue: number;
  estimatedCommission: number;
  activeDeals: number;
  wonDeals: number;
  conversionRate: number;
  urgentCount: number;
  progressingCount: number;
  blockedCount: number;
  staleCount: number;
  highValueCount: number;
}

// ============================================
// PORTFOLIO SUMMARY COMPONENT
// ============================================

export function PortfolioSummary({ leads, intelligence }: PortfolioSummaryProps) {
  const metrics = calculatePortfolioMetrics(leads, intelligence);
  const segments = calculateSegments(leads, intelligence);

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Wallet}
          label="Pipeline Value"
          value={formatPrice(metrics.totalValue)}
          subtext={`${metrics.activeDeals} active deals`}
          color="neutral"
        />
        <MetricCard
          icon={TrendingUp}
          label="Est. Commission"
          value={formatPrice(metrics.estimatedCommission)}
          subtext="3% average rate"
          color="positive"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Won This Month"
          value={metrics.wonDeals.toString()}
          subtext={`${metrics.conversionRate}% conversion`}
          color="success"
        />
        <MetricCard
          icon={Zap}
          label="Need Action"
          value={metrics.urgentCount.toString()}
          subtext={metrics.urgentCount > 0 ? "Today" : "All good"}
          color={metrics.urgentCount > 0 ? "warning" : "neutral"}
        />
      </div>

      {/* Segments */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SegmentBadge 
          label="Urgent" 
          count={metrics.urgentCount} 
          color="critical" 
          icon={AlertTriangle}
        />
        <SegmentBadge 
          label="Progressing" 
          count={metrics.progressingCount} 
          color="positive" 
          icon={TrendingUp}
        />
        <SegmentBadge 
          label="Blocked" 
          count={metrics.blockedCount} 
          color="warning" 
          icon={Clock}
        />
        <SegmentBadge 
          label="Stale" 
          count={metrics.staleCount} 
          color="neutral" 
          icon={TrendingDown}
        />
        <SegmentBadge 
          label="High Value" 
          count={metrics.highValueCount} 
          color="accent" 
          icon={Target}
        />
      </div>
    </div>
  );
}

// ============================================
// HIGH VALUE DEALS
// ============================================

interface HighValueDealsProps {
  leads: Lead[];
  intelligence: Record<string, SellerIntelligence>;
  onLeadClick: (leadId: string) => void;
}

export function HighValueDeals({ leads, intelligence, onLeadClick }: HighValueDealsProps) {
  // Filter high value deals (>500K or top 10% by price)
  const sortedByValue = [...leads]
    .filter(l => !['mandate_signed', 'lost'].includes(l.status))
    .sort((a, b) => b.price - a.price);
  
  const threshold = sortedByValue.length > 0 ? sortedByValue[Math.floor(sortedByValue.length * 0.1)]?.price || 500000 : 500000;
  const highValueDeals = sortedByValue.filter(l => l.price >= threshold).slice(0, 5);

  if (highValueDeals.length === 0) return null;

  return (
    <div className="surface-elevated rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="font-medium">High-Value Opportunities</h2>
          <p className="text-sm text-white/40">Top {highValueDeals.length} deals by value</p>
        </div>
      </div>

      <div className="space-y-2">
        {highValueDeals.map((lead) => {
          const intel = intelligence[lead.id];
          const isHot = intel && intel.mandate_readiness_score > 70;
          const daysInStage = getDaysInStage(lead);
          
          return (
            <div
              key={lead.id}
              onClick={() => onLeadClick(lead.id)}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{lead.owner_name}</p>
                  {isHot && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-medium">
                      HOT
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40">
                  {lead.property_type} · {lead.city}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-violet-400">{formatPrice(lead.price)}</p>
                <p className="text-xs text-white/30">
                  {daysInStage > 0 ? `${daysInStage} days` : 'New'}
                </p>
              </div>
              
              {intel && (
                <div className="w-16">
                  <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        intel.mandate_readiness_score > 70 ? 'bg-emerald-400' : 
                        intel.mandate_readiness_score > 40 ? 'bg-amber-400' : 'bg-white/30'
                      }`}
                      style={{ width: `${intel.mandate_readiness_score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// ACTION QUEUE
// ============================================

interface ActionQueueProps {
  leads: Lead[];
  intelligence: Record<string, SellerIntelligence>;
  onLeadClick: (leadId: string) => void;
}

export function ActionQueue({ leads, intelligence, onLeadClick }: ActionQueueProps) {
  // Find deals needing immediate action
  const urgentLeads = leads
    .filter(l => !['mandate_signed', 'lost'].includes(l.status))
    .map(lead => {
      const intel = intelligence[lead.id];
      const daysInStage = getDaysInStage(lead);
      let priority: 'critical' | 'high' | 'normal' = 'normal';
      let reason = '';
      
      // Critical: High readiness + engaged
      if (intel?.mandate_readiness_score > 70 && ['replied', 'call_scheduled'].includes(lead.status)) {
        priority = 'critical';
        reason = 'Ready to sign';
      }
      // High: Stuck in proposal/sent
      else if (['mandate_proposed', 'mandate_sent'].includes(lead.status) && daysInStage > 3) {
        priority = 'high';
        reason = daysInStage > 7 ? 'Stuck >7 days' : 'Follow up needed';
      }
      // High: New lead not contacted
      else if (lead.status === 'new') {
        priority = 'high';
        reason = 'Contact within 24h';
      }
      // Normal: Stale but not critical
      else if (daysInStage > 7) {
        priority = 'normal';
        reason = 'Re-engage';
      }
      
      return { lead, priority, reason, daysInStage };
    })
    .filter(item => item.priority !== 'normal' || item.daysInStage > 7)
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5);

  if (urgentLeads.length === 0) return null;

  return (
    <div className="surface-elevated rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="font-medium">Action Queue</h2>
          <p className="text-sm text-white/40">{urgentLeads.length} deals need attention</p>
        </div>
      </div>

      <div className="space-y-2">
        {urgentLeads.map(({ lead, priority, reason, daysInStage }) => (
          <div
            key={lead.id}
            onClick={() => onLeadClick(lead.id)}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors border-l-2 border-l-transparent hover:border-l-red-400/50"
          >
            <div className={`w-2 h-2 rounded-full ${
              priority === 'critical' ? 'bg-red-400' : 
              priority === 'high' ? 'bg-amber-400' : 'bg-white/30'
            }`} />
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{lead.owner_name}</p>
              <p className="text-xs text-white/40">{lead.city}</p>
            </div>
            
            <div className="text-right">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                'bg-white/10 text-white/50'
              }`}>
                {reason}
              </span>
            </div>
            
            <div className="text-right min-w-[60px]">
              <p className="text-sm font-medium">{formatPrice(lead.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  color: 'neutral' | 'positive' | 'success' | 'warning';
}

function MetricCard({ icon: Icon, label, value, subtext, color }: MetricCardProps) {
  const colors = {
    neutral: 'bg-white/[0.04] text-white/80',
    positive: 'bg-emerald-500/[0.08] text-emerald-400',
    success: 'bg-emerald-500/[0.08] text-emerald-400',
    warning: 'bg-amber-500/[0.08] text-amber-400'
  };

  return (
    <div className={`p-4 rounded-xl ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 opacity-60" />
        <span className="text-[10px] uppercase tracking-wider opacity-60">{label}</span>
      </div>
      <p className="text-xl font-semibold mb-1">{value}</p>
      <p className="text-xs opacity-50">{subtext}</p>
    </div>
  );
}

interface SegmentBadgeProps {
  label: string;
  count: number;
  color: 'critical' | 'warning' | 'positive' | 'neutral' | 'accent';
  icon: React.ElementType;
}

function SegmentBadge({ label, count, color, icon: Icon }: SegmentBadgeProps) {
  const colors = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral: 'bg-white/[0.04] text-white/60 border-white/[0.08]',
    accent: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 opacity-60" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-lg font-semibold">{count}</span>
    </div>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculatePortfolioMetrics(leads: Lead[], intelligence: Record<string, SellerIntelligence>): PortfolioMetrics {
  const activeLeads = leads.filter(l => !['mandate_signed', 'lost'].includes(l.status));
  const wonDeals = leads.filter(l => l.status === 'mandate_signed');
  
  const totalValue = activeLeads.reduce((acc, l) => acc + l.price, 0);
  const estimatedCommission = totalValue * 0.03; // 3% commission
  
  let urgentCount = 0;
  let progressingCount = 0;
  let blockedCount = 0;
  let staleCount = 0;
  let highValueCount = 0;
  
  const threshold = activeLeads.length > 0 
    ? [...activeLeads].sort((a, b) => b.price - a.price)[Math.floor(activeLeads.length * 0.1)]?.price || 500000
    : 500000;
  
  for (const lead of activeLeads) {
    const intel = intelligence[lead.id];
    const daysInStage = getDaysInStage(lead);
    
    // High value
    if (lead.price >= threshold) highValueCount++;
    
    // Urgent
    if ((intel?.mandate_readiness_score > 70 && ['replied', 'call_scheduled'].includes(lead.status)) ||
        (['mandate_proposed', 'mandate_sent'].includes(lead.status) && daysInStage > 3) ||
        lead.status === 'new') {
      urgentCount++;
    }
    // Blocked
    else if (['mandate_proposed', 'mandate_sent'].includes(lead.status)) {
      blockedCount++;
    }
    // Stale
    else if (daysInStage > 7) {
      staleCount++;
    }
    // Progressing
    else {
      progressingCount++;
    }
  }
  
  return {
    totalValue,
    estimatedCommission,
    activeDeals: activeLeads.length,
    wonDeals: wonDeals.length,
    conversionRate: leads.length > 0 ? Math.round((wonDeals.length / leads.length) * 100) : 0,
    urgentCount,
    progressingCount,
    blockedCount,
    staleCount,
    highValueCount
  };
}

function calculateSegments(leads: Lead[], intelligence: Record<string, SellerIntelligence>) {
  // Same logic as metrics but for display
  return calculatePortfolioMetrics(leads, intelligence);
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
