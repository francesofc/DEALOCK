/**
 * Workspace Init Step - Show what's being created
 */

'use client';

import { useEffect } from 'react';
import { useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { Loader2, CheckCircle2, Building2, MapPin, Settings, ListTodo } from 'lucide-react';

export function WorkspaceInitStep() {
  const { state, actions } = useOnboarding();
  const config = state.workspaceConfig;

  useEffect(() => {
    // Auto-advance to first actions after showing initialization
    const timer = setTimeout(() => {
      actions.setStep('first-actions');
    }, 2000);

    return () => clearTimeout(timer);
  }, [actions]);

  const initItems = [
    {
      icon: Building2,
      label: 'Agency Profile',
      description: config?.agency.name || state.input.agencyName,
      color: 'emerald',
    },
    {
      icon: MapPin,
      label: 'Market Configuration',
      description: config?.agency.geographicCoverage?.[0] || state.input.primaryMarket,
      color: 'blue',
    },
    {
      icon: Settings,
      label: 'Pipeline Stages',
      description: `${config?.pipelineStages?.length || 7} stages configured`,
      color: 'violet',
    },
    {
      icon: ListTodo,
      label: 'Onboarding Checklist',
      description: `${config?.onboardingChecklist?.length || 4} first actions`,
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Setting up your workspace</h2>
        <p className="text-white/60">
          We're configuring Dealock for {state.input.agencyName}
        </p>
      </div>

      <div className="space-y-3">
        {initItems.map((item, index) => (
          <div
            key={item.label}
            className="flex items-center gap-4 p-4 surface-subtle rounded-xl animate-in slide-in-from-left-2"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/10 flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 text-${item.color}-400`} />
            </div>
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className="text-sm text-white/50">{item.description}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-white/40">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Finalizing configuration...</span>
      </div>
    </div>
  );
}
