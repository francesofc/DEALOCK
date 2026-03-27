"use client";

import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  FileCheck,
  XCircle,
  MessageSquare,
  Calendar,
  FileText,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Lead, Activity, Mandate } from "@/types/database";
import { SellerIntelligence } from "@/types/seller-intelligence";
import { getDaysSinceLastActivity } from "@/lib/intelligence/next-actions";

// ============================================
// TYPES
// ============================================

interface MandateConversionProps {
  lead: Lead;
  activities: Activity[];
  mandate: Mandate | null;
  intelligence?: SellerIntelligence | null;
}

export interface ConversionAnalysis {
  probability: 'high' | 'medium' | 'low';
  probabilityPercent: number;
  confidence: 'strong' | 'moderate' | 'weak';
  estimatedDays: number | null;
  blockers: ConversionBlocker[];
  positiveFactors: string[];
  conversionActions: ConversionAction[];
}

export interface ConversionBlocker {
  id: string;
  type: 'property' | 'engagement' | 'timing' | 'objection' | 'process';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  resolution: string;
}

export interface ConversionAction {
  id: string;
  priority: 'critical' | 'high' | 'normal';
  action: string;
  impact: string;
  estimatedEffect: string;
}

// ============================================
// MANDATE PROBABILITY CARD
// ============================================

export function MandateProbability({ 
  lead, 
  activities, 
  mandate, 
  intelligence 
}: MandateConversionProps) {
  const analysis = analyzeConversion(lead, activities, mandate, intelligence);
  
  const colors = {
    high: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-400', label: 'High Chance' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-400', label: 'Medium Chance' },
    low: { bg: 'bg-red-500/10', text: 'text-red-400', bar: 'bg-red-400', label: 'Low Chance' }
  }[analysis.probability];

  return (
    <div className="surface-elevated rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-medium">Mandate Probability</h2>
          <p className="text-sm text-white/40">Likelihood of signing</p>
        </div>
      </div>

      {/* Probability Gauge */}
      <div className={`p-5 rounded-xl ${colors.bg} border border-white/[0.06] mb-6`}>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className={`text-4xl font-semibold ${colors.text}`}>
              {analysis.probabilityPercent}%
            </p>
            <p className={`text-sm ${colors.text} opacity-80`}>
              {colors.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40 uppercase tracking-wider">Confidence</p>
            <p className="text-sm text-white/70 capitalize">{analysis.confidence}</p>
          </div>
        </div>
        
        <div className="h-3 bg-white/[0.08] rounded-full overflow-hidden mb-3">
          <div 
            className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
            style={{ width: `${analysis.probabilityPercent}%` }}
          />
        </div>
        
        {analysis.estimatedDays !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="text-white/60">
              Estimated <span className="text-white">{analysis.estimatedDays} days</span> to signature
            </span>
          </div>
        )}
      </div>

      {/* Positive Factors */}
      {analysis.positiveFactors.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Positive Signals</span>
          </div>
          <div className="space-y-2">
            {analysis.positiveFactors.slice(0, 3).map((factor, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400/60 shrink-0 mt-0.5" />
                <p className="text-sm text-white/70">{factor}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// WHAT BLOCKS SIGNATURE
// ============================================

export function WhatBlocksSignature({ 
  lead, 
  activities, 
  mandate, 
  intelligence 
}: MandateConversionProps) {
  const analysis = analyzeConversion(lead, activities, mandate, intelligence);
  
  if (analysis.blockers.length === 0) {
    return (
      <div className="surface-elevated rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-medium">No Blockers</h2>
            <p className="text-sm text-white/40">Path to signature is clear</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10">
          <p className="text-sm text-emerald-400">
            All systems go. Push for signature now.
          </p>
        </div>
      </div>
    );
  }

  const severityColors = {
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400' }
  };

  return (
    <div className="surface-elevated rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="font-medium">What Blocks Signature</h2>
          <p className="text-sm text-white/40">
            {analysis.blockers.length} blocker{analysis.blockers.length > 1 ? 's' : ''} identified
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {analysis.blockers.map((blocker) => (
          <div 
            key={blocker.id}
            className={`p-4 rounded-xl ${severityColors[blocker.severity].bg} border ${severityColors[blocker.severity].border}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0`}>
                <BlockerIcon type={blocker.type} className={severityColors[blocker.severity].icon} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-1">{blocker.title}</h3>
                <p className="text-sm text-white/60 mb-2">{blocker.description}</p>
                <div className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                  <p className="text-xs text-white/50">{blocker.resolution}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CONVERSION ACTIONS
// ============================================

export function ConversionActions({ 
  lead, 
  activities, 
  mandate, 
  intelligence 
}: MandateConversionProps) {
  const analysis = analyzeConversion(lead, activities, mandate, intelligence);

  return (
    <div className="surface-elevated rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="font-medium">Actions to Get Signature</h2>
          <p className="text-sm text-white/40">Prioritized by impact</p>
        </div>
      </div>

      <div className="space-y-2">
        {analysis.conversionActions.map((action, index) => (
          <ActionItem 
            key={action.id} 
            action={action} 
            index={index}
            isTop={index === 0}
          />
        ))}
      </div>

      {analysis.conversionActions.length === 0 && (
        <div className="p-4 rounded-xl bg-white/[0.03] text-center">
          <p className="text-sm text-white/50">No specific actions needed</p>
        </div>
      )}
    </div>
  );
}

function ActionItem({ 
  action, 
  index,
  isTop
}: { 
  action: ConversionAction; 
  index: number;
  isTop: boolean;
}) {
  const priorityColors = {
    critical: { bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500 text-white' },
    high: { bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500 text-black' },
    normal: { bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500 text-white' }
  }[action.priority];

  return (
    <div className={`p-4 rounded-xl ${isTop ? 'bg-violet-500/[0.08] border border-violet-500/20' : 'bg-white/[0.03]'} hover:bg-white/[0.06] transition-colors cursor-pointer group`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${priorityColors.bg} flex items-center justify-center shrink-0`}>
          <span className={`text-sm font-semibold ${priorityColors.text}`}>{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm">{action.action}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors.badge}`}>
              {action.priority}
            </span>
          </div>
          <p className="text-xs text-white/50 mb-1">{action.impact}</p>
          <p className="text-xs text-emerald-400/70">{action.estimatedEffect}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONVERSION FUNNEL
// ============================================

export function ConversionFunnel({ 
  lead, 
  activities, 
  mandate
}: MandateConversionProps) {
  const stages = [
    { id: 'new', label: 'New Lead', icon: Users },
    { id: 'qualified', label: 'Qualified', icon: FileCheck },
    { id: 'proposal', label: 'Proposal', icon: FileText },
    { id: 'sent', label: 'Sent', icon: MessageSquare },
    { id: 'signed', label: 'Signed', icon: CheckCircle2 }
  ];

  const currentStageIndex = getCurrentStageIndex(lead, mandate);
  const isBlocked = currentStageIndex > 0 && currentStageIndex < 4;

  return (
    <div className="surface-elevated rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-medium">Conversion Funnel</h2>
          <p className="text-sm text-white/40">Your position in the journey</p>
        </div>
      </div>

      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/[0.08] -translate-y-1/2" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-emerald-400 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
        />

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const isActive = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCurrent 
                      ? 'bg-violet-500 border-violet-500 scale-110' 
                      : isActive 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'bg-[#0d0d0f] border-white/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/30'}`} />
                </div>
                <span className={`text-xs mt-2 ${isCurrent ? 'text-violet-400 font-medium' : isActive ? 'text-white/70' : 'text-white/30'}`}>
                  {stage.label}
                </span>
                {isCurrent && isBlocked && (
                  <span className="text-[10px] text-amber-400 mt-1">Blocked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current status */}
      <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-white/40 uppercase tracking-wider">Current Status</span>
        </div>
        <p className="text-white/80">
          {getStageDescription(lead, mandate)}
        </p>
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function BlockerIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'property': return <FileText className={`w-4 h-4 ${className}`} />;
    case 'engagement': return <MessageSquare className={`w-4 h-4 ${className}`} />;
    case 'timing': return <Clock className={`w-4 h-4 ${className}`} />;
    case 'objection': return <XCircle className={`w-4 h-4 ${className}`} />;
    case 'process': return <FileCheck className={`w-4 h-4 ${className}`} />;
    default: return <AlertTriangle className={`w-4 h-4 ${className}`} />;
  }
}

function analyzeConversion(
  lead: Lead,
  activities: Activity[],
  mandate: Mandate | null,
  intelligence?: SellerIntelligence | null
): ConversionAnalysis {
  const daysSinceActivity = getDaysSinceLastActivity(activities);
  const blockers: ConversionBlocker[] = [];
  const positiveFactors: string[] = [];
  const conversionActions: ConversionAction[] = [];

  // Calculate base probability
  let probabilityScore = intelligence?.mandate_readiness_score || 30;
  
  // Positive factors
  if (intelligence?.mandate_readiness_score && intelligence.mandate_readiness_score > 60) {
    positiveFactors.push(`Readiness score of ${intelligence.mandate_readiness_score}% indicates strong interest`);
  }
  if (lead.status === 'replied' || lead.status === 'call_scheduled') {
    positiveFactors.push('Seller actively engaged in conversation');
    probabilityScore += 15;
  }
  if (mandate?.status === 'sent') {
    positiveFactors.push('Mandate document sent - decision point reached');
    probabilityScore += 20;
  }
  if (mandate?.status === 'signed') {
    positiveFactors.push('Mandate signed - exclusivity secured');
    probabilityScore = 100;
  }
  if (daysSinceActivity <= 3) {
    positiveFactors.push('Recent activity - momentum maintained');
    probabilityScore += 10;
  }

  // Blockers
  if (daysSinceActivity > 7) {
    blockers.push({
      id: 'stale',
      type: 'engagement',
      severity: 'warning',
      title: 'No recent contact',
      description: `${daysSinceActivity} days since last activity. Seller may be cooling off or exploring other agencies.`,
      resolution: 'Re-engage with market update or comparable sale'
    });
    probabilityScore -= 15;
  }

  if (daysSinceActivity > 14) {
    blockers.push({
      id: 'cold',
      type: 'engagement',
      severity: 'critical',
      title: 'Lead going cold',
      description: 'Two weeks without contact significantly reduces conversion probability.',
      resolution: 'Call immediately with concrete value proposition'
    });
    probabilityScore -= 20;
  }

  if (mandate?.status === 'sent' && daysSinceActivity > 3) {
    blockers.push({
      id: 'signature_pending',
      type: 'process',
      severity: 'critical',
      title: 'Signature pending',
      description: `Mandate sent ${daysSinceActivity} days ago but not signed. Seller may have concerns or objections.`,
      resolution: 'Call to address concerns and offer to meet in person'
    });
    probabilityScore -= 10;
  }

  if (lead.status === 'mandate_proposed' && daysSinceActivity > 5) {
    blockers.push({
      id: 'proposal_stuck',
      type: 'objection',
      severity: 'warning',
      title: 'Proposal stuck',
      description: 'Proposal sent but no response after 5+ days. Possible hesitation or comparison shopping.',
      resolution: 'Follow up with urgency - ask directly about concerns'
    });
    probabilityScore -= 10;
  }

  if (!lead.area_m2 || !lead.bedrooms) {
    blockers.push({
      id: 'incomplete_property',
      type: 'property',
      severity: 'info',
      title: 'Incomplete property details',
      description: 'Missing key property specifications may delay mandate preparation.',
      resolution: 'Complete property information before sending mandate'
    });
    probabilityScore -= 5;
  }

  // Conversion actions based on stage
  if (mandate?.status === 'sent') {
    conversionActions.push({
      id: 'followup_signature',
      priority: 'critical',
      action: 'Call for signature confirmation',
      impact: 'Direct path to conversion',
      estimatedEffect: '+25% conversion chance'
    });
    conversionActions.push({
      id: 'address_concerns',
      priority: 'high',
      action: 'Ask about concerns or objections',
      impact: 'Removes blockers',
      estimatedEffect: '+15% conversion chance'
    });
  } else if (lead.status === 'mandate_proposed') {
    conversionActions.push({
      id: 'push_decision',
      priority: 'critical',
      action: 'Push for decision deadline',
      impact: 'Creates urgency',
      estimatedEffect: '+20% conversion chance'
    });
  } else if (lead.status === 'replied' || lead.status === 'call_scheduled') {
    if (intelligence?.mandate_readiness_score && intelligence.mandate_readiness_score > 70) {
      conversionActions.push({
        id: 'propose_now',
        priority: 'critical',
        action: 'Propose mandate immediately',
        impact: 'Strike while hot',
        estimatedEffect: '+30% conversion chance'
      });
    }
    conversionActions.push({
      id: 'schedule_meeting',
      priority: 'high',
      action: 'Schedule qualification call',
      impact: 'Builds relationship',
      estimatedEffect: '+15% conversion chance'
    });
  } else if (lead.status === 'new') {
    conversionActions.push({
      id: 'first_contact',
      priority: 'critical',
      action: 'Call within 24 hours',
      impact: 'First mover advantage',
      estimatedEffect: '+40% response rate'
    });
  }

  // General actions
  if (daysSinceActivity > 7) {
    conversionActions.push({
      id: 'reengage',
      priority: 'high',
      action: 'Send market update or comparable',
      impact: 'Restarts conversation',
      estimatedEffect: '+10% re-engagement'
    });
  }

  // Sort actions by priority
  conversionActions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, normal: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Calculate final probability
  probabilityScore = Math.max(0, Math.min(100, probabilityScore));
  
  let probability: 'high' | 'medium' | 'low';
  if (probabilityScore >= 70) probability = 'high';
  else if (probabilityScore >= 40) probability = 'medium';
  else probability = 'low';

  // Confidence based on data quality
  let confidence: 'strong' | 'moderate' | 'weak';
  if (activities.length > 3 && intelligence?.mandate_readiness_score) {
    confidence = 'strong';
  } else if (activities.length > 0) {
    confidence = 'moderate';
  } else {
    confidence = 'weak';
  }

  // Estimated days to close
  let estimatedDays: number | null = null;
  if (mandate?.status === 'sent') {
    estimatedDays = 3;
  } else if (lead.status === 'mandate_proposed') {
    estimatedDays = 7;
  } else if (lead.status === 'replied' || lead.status === 'call_scheduled') {
    estimatedDays = 14;
  } else if (['qualified', 'contacted'].includes(lead.status)) {
    estimatedDays = 21;
  }

  return {
    probability,
    probabilityPercent: probabilityScore,
    confidence,
    estimatedDays,
    blockers,
    positiveFactors,
    conversionActions
  };
}

function getCurrentStageIndex(lead: Lead, mandate: Mandate | null): number {
  if (mandate?.status === 'signed') return 4;
  if (mandate?.status === 'sent') return 3;
  if (['mandate_proposed'].includes(lead.status)) return 2;
  if (['replied', 'call_scheduled'].includes(lead.status)) return 1;
  return 0;
}

function getStageDescription(lead: Lead, mandate: Mandate | null): string {
  if (mandate?.status === 'signed') {
    return 'Exclusivity secured. Focus on buyer matching and activation.';
  }
  if (mandate?.status === 'sent') {
    return 'Mandate sent awaiting signature. This is the critical conversion moment.';
  }
  if (lead.status === 'mandate_proposed') {
    return 'Proposal made to seller. Push for decision while interest is high.';
  }
  if (['replied', 'call_scheduled'].includes(lead.status)) {
    return 'Seller engaged. Build trust and prepare mandate proposal.';
  }
  if (lead.status === 'qualified') {
    return 'Lead qualified. Establish contact and understand needs.';
  }
  return 'New lead. Initial contact needed to start conversion journey.';
}
