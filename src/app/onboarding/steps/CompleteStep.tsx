/**
 * Complete Step - Onboarding finished
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { CheckCircle2, ArrowRight, Building2, Users, Target, Upload, Plus, Sparkles } from 'lucide-react';

export function CompleteStep() {
  const router = useRouter();
  const { state } = useOnboarding();

  // Auto-redirect after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const features = [
    {
      icon: Target,
      title: 'Command Center',
      description: 'Your daily priorities at a glance',
    },
    {
      icon: Building2,
      title: 'Sellers & Mandates',
      description: 'Track leads and exclusivity agreements',
    },
    {
      icon: Users,
      title: 'Buyers & Matches',
      description: 'Connect qualified buyers with properties',
    },
  ];

  return (
    <div className="text-center space-y-8">
      {/* Success animation */}
      <div className="relative inline-flex">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping" />
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Welcome to Dealock, {state.input.userName?.split(' ')[0] || 'Agent'}
        </h2>
        <p className="text-white/60 max-w-md mx-auto">
          {state.input.agencyName} is now set up and ready. Your commercial cockpit awaits.
        </p>
      </div>

      {/* Quick Start Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Recommended First Steps</h3>
        
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            onClick={() => router.push('/sellers/new')}
            className="p-4 surface-subtle rounded-xl border border-white/[0.06] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="font-medium mb-1">Add Your First Lead</div>
            <div className="text-sm text-white/50">Create a seller listing</div>
          </button>
          
          <button
            onClick={() => router.push('/import')}
            className="p-4 surface-subtle rounded-xl border border-white/[0.06] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <div className="font-medium mb-1">Import Existing Data</div>
            <div className="text-sm text-white/50">CSV or spreadsheet</div>
          </button>
          
          <button
            onClick={() => router.push('/settings/agency')}
            className="p-4 surface-subtle rounded-xl border border-white/[0.06] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div className="font-medium mb-1">Enrich Profile</div>
            <div className="text-sm text-white/50">AI website analysis</div>
          </button>
        </div>
      </div>

      {/* Features ready */}
      <div className="p-4 bg-white/[0.02] rounded-xl">
        <h3 className="text-sm font-medium text-white/50 mb-3">Your Workspace Includes</h3>
        <div className="grid gap-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm text-white/70">{feature.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="pt-4" data-testid="onboarding-complete">
        <Button
          size="lg"
          className="bg-white text-black hover:bg-white/90 group"
          onClick={() => router.push('/')}
          data-testid="onboarding-enter-workspace"
        >
          Enter Your Workspace
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <p className="text-sm text-white/40">
        Auto-redirecting in a few seconds...
      </p>
    </div>
  );
}
