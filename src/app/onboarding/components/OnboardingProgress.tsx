/**
 * Onboarding Progress Sidebar Component
 */

'use client';

import { useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { OnboardingStep } from '@/types/onboarding';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const steps: { id: OnboardingStep; label: string }[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'basic-info', label: 'Agency Info' },
  { id: 'enrichment', label: 'AI Enrichment' },
  { id: 'workspace-init', label: 'Workspace Setup' },
  { id: 'first-actions', label: 'First Actions' },
  { id: 'complete', label: 'Complete' },
];

export function OnboardingProgress() {
  const { state } = useOnboarding();
  const currentStepIndex = steps.findIndex(s => s.id === state.step);

  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
          Setup Progress
        </h3>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 transition-opacity ${
                  status === 'upcoming' ? 'opacity-40' : ''
                }`}
              >
                <div className="shrink-0">
                  {status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {status === 'current' && (
                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  )}
                  {status === 'upcoming' && (
                    <Circle className="w-5 h-5 text-white/30" />
                  )}
                </div>
                
                <span className={`text-sm ${
                  status === 'current' ? 'font-medium text-white' : 'text-white/60'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/50">Overall Progress</span>
          <span className="font-medium">{Math.round(state.progress.overallPercent)}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${state.progress.overallPercent}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      {state.step === 'basic-info' && (
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-400/80">
            <strong>Tip:</strong> Adding your website helps us auto-configure your workspace with the right specialties and property types.
          </p>
        </div>
      )}

      {state.step === 'first-actions' && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <p className="text-sm text-amber-400/80">
            <strong>Tip:</strong> Complete at least the critical tasks to get the most from Dealock from day one.
          </p>
        </div>
      )}
    </div>
  );
}
