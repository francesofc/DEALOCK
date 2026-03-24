/**
 * ============================================
 * DEALOCK ONBOARDING PAGE
 * ============================================
 * 
 * AI-assisted onboarding flow for new Dealock users.
 * Supports both fresh onboarding and resuming incomplete setup.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingProvider, useOnboarding } from '@/lib/onboarding/OnboardingContext';
import { checkOnboardingState, WorkspaceRecord } from '@/lib/data/workspace';
import { WelcomeStep } from './steps/WelcomeStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { EnrichmentStep } from './steps/EnrichmentStep';
import { WorkspaceInitStep } from './steps/WorkspaceInitStep';
import { FirstActionsStep } from './steps/FirstActionsStep';
import { CompleteStep } from './steps/CompleteStep';
import { OnboardingProgress } from './components/OnboardingProgress';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function OnboardingFlow() {
  const { state, isLoading, error } = useOnboarding();

  // Prevent body scroll during onboarding
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const renderStep = () => {
    switch (state.step) {
      case 'welcome':
        return <WelcomeStep />;
      case 'basic-info':
        return <BasicInfoStep />;
      case 'enrichment':
        return <EnrichmentStep />;
      case 'workspace-init':
        return <WorkspaceInitStep />;
      case 'first-actions':
      case 'data-import':
        return <FirstActionsStep />;
      case 'complete':
        return <CompleteStep />;
      default:
        return <WelcomeStep />;
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-white/60">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-white text-black hover:bg-white/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex">
      {/* Left side - Progress */}
      <div className="hidden lg:flex w-1/3 max-w-md flex-col border-r border-white/[0.06]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="/brand/dealock-symbol-white.svg" 
              alt="Dealock" 
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold">Dealock</span>
          </div>
          <OnboardingProgress />
        </div>
        
        {/* Contextual help */}
        <div className="mt-auto p-8 border-t border-white/[0.06]">
          <p className="text-sm text-white/50">
            Need help? Contact us at{' '}
            <a href="mailto:onboarding@dealock.com" className="text-white/70 hover:text-white">
              onboarding@dealock.com
            </a>
          </p>
        </div>
      </div>

      {/* Right side - Step content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <img 
              src="/brand/dealock-symbol-white.svg" 
              alt="Dealock" 
              className="h-6 w-auto"
            />
            <span className="font-medium">Dealock</span>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper that loads existing workspace state
function OnboardingPageWrapper() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [existingWorkspace, setExistingWorkspace] = useState<WorkspaceRecord | undefined>();
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const result = await checkOnboardingState();
        
        if (result.workspace) {
          setExistingWorkspace(result.workspace);
          
          // If onboarding is already completed, redirect to dashboard
          if (result.workspace.onboarding_status === 'completed') {
            router.replace('/');
            return;
          }
        }
      } catch (error) {
        console.error('[Onboarding] Error loading workspace:', error);
        setLoadError('Failed to load workspace state');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-white/50">
            {existingWorkspace ? 'Resuming your setup...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-semibold">Failed to Load</h2>
          <p className="text-white/60">{loadError}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-white text-black hover:bg-white/90"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <OnboardingProvider initialWorkspace={existingWorkspace}>
      <OnboardingFlow />
    </OnboardingProvider>
  );
}

export default OnboardingPageWrapper;
