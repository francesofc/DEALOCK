/**
 * Enrichment Step - AI analysis of agency website
 */

'use client';

import { useEffect } from 'react';
import { useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export function EnrichmentStep() {
  const { state, actions } = useOnboarding();

  useEffect(() => {
    // Auto-advance after brief enrichment check
    const timer = setTimeout(() => {
      actions.initializeWorkspace();
    }, 1500);

    return () => clearTimeout(timer);
  }, [actions]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          {state.enrichedProfile ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          ) : (
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0d0d0f] flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">
          {state.enrichedProfile ? 'Profile Enriched' : 'Analyzing Your Agency'}
        </h2>
        <p className="text-white/60 max-w-md">
          {state.input.website ? (
            <>
              We're analyzing <span className="text-white/80">{state.input.website}</span> to 
              understand your specialties and market positioning.
            </>
          ) : (
            <>
              Creating your personalized workspace based on your market and property types.
            </>
          )}
        </p>
      </div>

      {state.enrichedProfile && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl max-w-md">
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Successfully identified</span>
          </div>
          <ul className="text-sm text-white/60 space-y-1">
            {state.enrichedProfile.specialties?.map((specialty, i) => (
              <li key={i}>• {specialty}</li>
            ))}
            {state.enrichedProfile.propertyTypes?.map((type, i) => (
              <li key={i}>• {type} specialist</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-white/40">
        Initializing your workspace...
      </p>
    </div>
  );
}
