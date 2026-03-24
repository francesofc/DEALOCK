/**
 * Welcome Step - First impression, value proposition
 */

'use client';

import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { Sparkles, Target, Users, TrendingUp } from 'lucide-react';

export function WelcomeStep() {
  const { actions } = useOnboarding();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          <span>AI-Assisted Onboarding</span>
        </div>
        
        <h1 className="text-3xl font-semibold mb-4">
          Welcome to Dealock
        </h1>
        
        <p className="text-lg text-white/60 max-w-lg mx-auto">
          The commercial real estate operating system that transforms 
          your pipeline into a clear, actionable cockpit.
        </p>
      </div>

      {/* Value props */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 surface-elevated rounded-xl">
          <Target className="w-8 h-8 text-emerald-400 mb-3" />
          <h3 className="font-medium mb-1">Clear Priorities</h3>
          <p className="text-sm text-white/50">
            Know exactly what to do next
          </p>
        </div>
        
        <div className="p-5 surface-elevated rounded-xl">
          <Users className="w-8 h-8 text-violet-400 mb-3" />
          <h3 className="font-medium mb-1">Smart Matches</h3>
          <p className="text-sm text-white/50">
            Connect buyers with properties
          </p>
        </div>
        
        <div className="p-5 surface-elevated rounded-xl">
          <TrendingUp className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="font-medium mb-1">Track Mandates</h3>
          <p className="text-sm text-white/50">
            Manage exclusivity agreements
          </p>
        </div>
      </div>

      {/* Quick setup promise */}
      <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-medium mb-1">Intelligent Setup</h3>
            <p className="text-sm text-white/50">
              We'll create your workspace from just your agency name and market. 
              Our AI can enrich your profile from your website, or you can customize everything manually.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          size="lg" 
          className="flex-1 bg-white text-black hover:bg-white/90"
          onClick={() => actions.setStep('basic-info')}
          data-testid="onboarding-get-started"
        >
          Get Started
        </Button>
      </div>

      <p className="text-center text-sm text-white/40">
        Takes about 2 minutes to set up
      </p>
    </div>
  );
}
