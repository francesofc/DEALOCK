import { Mandate, MatchOpportunity } from "@/types/database";

export interface ActivationState {
  readiness: 'low' | 'medium' | 'high';
  readinessPercent: number;
  nextStep: string;
  reason: string;
  isComplete: boolean;
  hasExcellentMatch: boolean;
}

export interface ActivationFactors {
  hasArea: boolean;
  hasBedrooms: boolean;
  hasPhotos: boolean;
  hasDescription: boolean;
  matchCount: number;
  hasExcellentMatch: boolean;
}

export function getActivationFactors(
  mandate: Mandate,
  matches: MatchOpportunity[]
): ActivationFactors {
  return {
    hasArea: (mandate.area_m2 || 0) > 0,
    hasBedrooms: (mandate.bedrooms || 0) > 0,
    hasPhotos: false, // TODO: add photos field to mandate
    hasDescription: (mandate.notes?.length || 0) > 20,
    matchCount: matches.filter(m => m.target_id === mandate.id).length,
    hasExcellentMatch: matches.some(m => 
      m.target_id === mandate.id && m.match_score === 'excellent'
    ),
  };
}

export function calculateActivationState(
  mandate: Mandate,
  matches: MatchOpportunity[]
): ActivationState {
  const factors = getActivationFactors(mandate, matches);
  
  // Base readiness from mandate status
  let readinessPercent = 0;
  let readiness: 'low' | 'medium' | 'high' = 'low';
  
  switch (mandate.status) {
    case 'draft':
      readinessPercent = 20;
      break;
    case 'sent':
      readinessPercent = 50;
      readiness = 'medium';
      break;
    case 'signed':
      readinessPercent = 70;
      readiness = 'high';
      break;
    case 'expired':
    case 'terminated':
      readinessPercent = 0;
      break;
  }
  
  // Property completeness bonus (max +30%)
  if (factors.hasArea) readinessPercent += 10;
  if (factors.hasBedrooms) readinessPercent += 10;
  if (factors.hasDescription) readinessPercent += 10;
  
  // Matches bonus (max +30%)
  if (factors.matchCount > 0) readinessPercent += 20;
  if (factors.hasExcellentMatch) readinessPercent += 10;
  
  // Clamp to 0-100
  readinessPercent = Math.min(100, Math.max(0, readinessPercent));
  
  // Recalculate readiness band
  if (readinessPercent >= 70) readiness = 'high';
  else if (readinessPercent >= 40) readiness = 'medium';
  else readiness = 'low';
  
  // Determine next step and reason
  let nextStep = '';
  let reason = '';
  let isComplete = false;
  
  if (mandate.status === 'draft') {
    const propertyComplete = factors.hasArea && factors.hasBedrooms;
    if (!propertyComplete) {
      nextStep = 'Complete property details';
      reason = 'Missing property specifications';
    } else {
      nextStep = 'Send mandate for signature';
      reason = 'Ready to propose to seller';
    }
  } else if (mandate.status === 'sent') {
    nextStep = 'Follow up for signature';
    reason = 'Awaiting seller response';
  } else if (mandate.status === 'signed') {
    if (factors.matchCount === 0) {
      nextStep = 'Create buyer matches';
      reason = 'No qualified buyers linked yet';
    } else if (!factors.hasExcellentMatch) {
      nextStep = 'Review buyer matches';
      reason = `${factors.matchCount} match${factors.matchCount > 1 ? 'es' : ''} linked - evaluate quality`;
    } else {
      nextStep = 'Launch commercial activation';
      reason = 'Excellent match found - ready to activate';
      isComplete = true;
    }
  } else if (mandate.status === 'expired') {
    nextStep = 'Renew or close mandate';
    reason = 'Mandate has expired';
  } else if (mandate.status === 'terminated') {
    nextStep = 'Mandate ended';
    reason = 'Agreement was terminated';
  }
  
  return {
    readiness,
    readinessPercent,
    nextStep,
    reason,
    isComplete,
    hasExcellentMatch: factors.hasExcellentMatch,
  };
}

export function getReadinessColor(readiness: 'low' | 'medium' | 'high'): {
  bg: string;
  text: string;
  bar: string;
} {
  switch (readiness) {
    case 'high':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-400' };
    case 'medium':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-400' };
    case 'low':
    default:
      return { bg: 'bg-white/[0.04]', text: 'text-white/60', bar: 'bg-white/40' };
  }
}
