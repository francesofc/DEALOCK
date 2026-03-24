/**
 * ============================================
 * ONBOARDING GATE
 * ============================================
 * 
 * Checks if user needs onboarding and redirects appropriately.
 * Handles resume logic for incomplete onboarding.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkOnboardingState, OnboardingCheckResult } from '@/lib/data/workspace';
import { Loader2 } from 'lucide-react';

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [checkResult, setCheckResult] = useState<OnboardingCheckResult | null>(null);

  useEffect(() => {
    async function checkState() {
      // Don't check if already on onboarding page
      if (pathname?.startsWith('/onboarding')) {
        setIsChecking(false);
        return;
      }

      try {
        const result = await checkOnboardingState();
        setCheckResult(result);

        if (result.needsOnboarding) {
          // Redirect to onboarding
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('[OnboardingGate] Error checking state:', error);
      } finally {
        setIsChecking(false);
      }
    }

    checkState();
  }, [router, pathname]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  // If needs onboarding and not on onboarding page, we're redirecting
  if (checkResult?.needsOnboarding && !pathname?.startsWith('/onboarding')) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-white/50">Redirecting to onboarding...</p>
        </div>
      </div>
    );
  }

  // Otherwise, render children
  return <>{children}</>;
}
