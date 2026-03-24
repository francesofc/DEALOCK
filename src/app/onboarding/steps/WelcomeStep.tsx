/**
 * Welcome Step - First impression, value proposition
 */

'use client';

import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { useRouter } from 'next/navigation';
import { Sparkles, Target, Users, TrendingUp, Upload, ArrowRight } from 'lucide-react';

export function WelcomeStep() {
  const { actions } = useOnboarding();
  const router = useRouter();

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

      {/* Setup options */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-emerald-500/20 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Smart Setup</h3>
              <p className="text-sm text-white/50">
                We will create your workspace from your agency details. Optional AI enrichment available from your website.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-blue-500/20 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Import & Migrate</h3>
              <p className="text-sm text-white/50">
                Already have data? Import from CSV, spreadsheets, or export files. We will map and validate everything.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            size="lg" 
            className="flex-1 bg-white text-black hover:bg-white/90 group"
            onClick={() => actions.setStep('basic-info')}
            data-testid="onboarding-get-started"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="flex-1 border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
            onClick={() => router.push('/import')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Existing Data
          </Button>
        </div>
        
        <p className="text-center text-sm text-white/40">
          New setup takes ~2 minutes · Import supports CSV and CRM exports
        </p>
      </div>
    </div>
  );
}
