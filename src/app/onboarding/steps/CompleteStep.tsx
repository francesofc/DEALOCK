/**
 * Complete Step - Onboarding finished
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { CheckCircle2, ArrowRight, Building2, Users, Target } from 'lucide-react';

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

      {/* What's ready */}
      <div className="grid gap-3 text-left">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex items-center gap-4 p-4 surface-subtle rounded-xl"
          >
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <div className="font-medium">{feature.title}</div>
              <div className="text-sm text-white/50">{feature.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-4" data-testid="onboarding-complete">
        <Button
          size="lg"
          className="bg-white text-black hover:bg-white/90"
          onClick={() => router.push('/')}
          data-testid="onboarding-enter-workspace"
        >
          Enter Your Workspace
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <p className="text-sm text-white/40">
        Redirecting automatically in a few seconds...
      </p>
    </div>
  );
}
