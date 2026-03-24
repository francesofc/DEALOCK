/**
 * ============================================
 * DEALOCK ONBOARDING CONTEXT (Real Persistence)
 * ============================================
 * 
 * React context for managing onboarding flow state with Supabase persistence.
 */

'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  OnboardingState, 
  OnboardingInput, 
  OnboardingStep,
  WorkspaceConfig,
  EnrichedAgencyProfile,
  PropertyType
} from '@/types/onboarding';
import { initializeWorkspace, enrichmentService } from './workspace-init';
import { 
  createWorkspace, 
  updateOnboardingProgress, 
  completeOnboarding,
  WorkspaceRecord,
  workspaceToConfig,
} from '@/lib/data/workspace';

// ============================================
// CONTEXT TYPES
// ============================================

interface OnboardingContextType {
  state: OnboardingState;
  workspaceId?: string;
  actions: {
    setStep: (step: OnboardingStep) => Promise<void>;
    updateInput: (input: Partial<OnboardingInput>) => void;
    submitBasicInfo: (input: OnboardingInput) => Promise<void>;
    triggerEnrichment: () => Promise<void>;
    initializeWorkspace: () => Promise<void>;
    completeTask: (taskId: string) => Promise<void>;
    completeOnboarding: () => Promise<void>;
    loadExistingWorkspace: (workspace: WorkspaceRecord) => void;
  };
  isLoading: boolean;
  error: string | null;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: OnboardingState = {
  step: 'welcome',
  input: {
    agencyName: '',
    primaryMarket: '',
    userName: '',
    userEmail: '',
    teamSize: 'solo',
    hasExistingData: false,
    language: 'en',
    propertyTypes: [],
  },
  progress: {
    completedSteps: [],
    overallPercent: 0,
  },
};

// ============================================
// REDUCER
// ============================================

type OnboardingAction =
  | { type: 'SET_STEP'; payload: OnboardingStep }
  | { type: 'UPDATE_INPUT'; payload: Partial<OnboardingInput> }
  | { type: 'SET_ENRICHED_PROFILE'; payload: EnrichedAgencyProfile }
  | { type: 'SET_WORKSPACE_CONFIG'; payload: WorkspaceConfig }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: { step: OnboardingStep; percent: number } }
  | { type: 'LOAD_WORKSPACE'; payload: { workspace: WorkspaceRecord; config: WorkspaceConfig } }
  | { type: 'RESET' };

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        step: action.payload,
        progress: {
          ...state.progress,
          completedSteps: [...state.progress.completedSteps, state.step],
        },
      };
      
    case 'UPDATE_INPUT':
      return {
        ...state,
        input: { ...state.input, ...action.payload },
      };

    case 'SET_ENRICHED_PROFILE':
      return {
        ...state,
        enrichedProfile: action.payload,
      };
      
    case 'SET_WORKSPACE_CONFIG':
      return {
        ...state,
        workspaceConfig: action.payload,
      };

    case 'LOAD_WORKSPACE':
      return {
        ...state,
        step: action.payload.workspace.onboarding_step as OnboardingStep,
        input: {
          agencyName: action.payload.workspace.agency_name,
          primaryMarket: action.payload.workspace.primary_market,
          userName: '', // Could be loaded from user profile
          userEmail: action.payload.workspace.agency_email || '',
          website: action.payload.workspace.agency_website,
          phone: action.payload.workspace.agency_phone,
          teamSize: action.payload.workspace.team_size as 'solo' | 'small' | 'medium' | 'large',
          hasExistingData: false,
          language: (action.payload.workspace.settings?.language as 'en' | 'fr' | 'pt' | 'es') || 'en',
          propertyTypes: (action.payload.workspace.property_types as PropertyType[]) || [],
        },
        workspaceConfig: action.payload.config,
        progress: {
          completedSteps: [],
          overallPercent: action.payload.workspace.onboarding_status === 'completed' ? 100 : 50,
        },
      };
      
    case 'COMPLETE_TASK':
      if (!state.workspaceConfig) return state;
      return {
        ...state,
        workspaceConfig: {
          ...state.workspaceConfig,
          onboardingChecklist: state.workspaceConfig.onboardingChecklist.map(task =>
            task.id === action.payload ? { ...task, isCompleted: true } : task
          ),
        },
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: {
          completedSteps: [...state.progress.completedSteps, action.payload.step],
          overallPercent: action.payload.percent,
        },
      };
      
    case 'RESET':
      return initialState;
      
    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface OnboardingProviderProps {
  children: ReactNode;
  initialWorkspace?: WorkspaceRecord;
}

export function OnboardingProvider({ children, initialWorkspace }: OnboardingProviderProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(initialWorkspace?.id);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load existing workspace on mount
  useEffect(() => {
    if (initialWorkspace) {
      const config = workspaceToConfig(initialWorkspace);
      dispatch({ 
        type: 'LOAD_WORKSPACE', 
        payload: { workspace: initialWorkspace, config } 
      });
    }
  }, [initialWorkspace]);

  const setStep = useCallback(async (step: OnboardingStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
    
    // Persist step change
    if (workspaceId) {
      try {
        await updateOnboardingProgress(workspaceId, { step });
      } catch (err) {
        console.error('Failed to persist step:', err);
      }
    }
  }, [workspaceId]);

  const updateInput = useCallback((input: Partial<OnboardingInput>) => {
    dispatch({ type: 'UPDATE_INPUT', payload: input });
  }, []);

  const submitBasicInfo = useCallback(async (input: OnboardingInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create workspace in Supabase
      const workspace = await createWorkspace(input);
      setWorkspaceId(workspace.id);
      dispatch({ type: 'UPDATE_INPUT', payload: input });
      dispatch({ type: 'SET_STEP', payload: 'enrichment' });
      
      // Persist progress
      await updateOnboardingProgress(workspace.id, { 
        step: 'enrichment',
        status: 'in_progress',
      });
      
      // Calculate progress
      dispatch({ 
        type: 'UPDATE_PROGRESS', 
        payload: { step: 'basic-info', percent: 25 } 
      });
      
      // Trigger enrichment if website provided
      if (input.website) {
        try {
          const enriched = await enrichmentService.analyzeWebsite(input.website);
          if (enriched) {
            dispatch({ 
              type: 'SET_ENRICHED_PROFILE', 
              payload: { ...enriched, name: input.agencyName } as EnrichedAgencyProfile 
            });
          }
        } catch (err) {
          console.warn('[Onboarding] Enrichment failed, continuing:', err);
        }
      }
      
      dispatch({ type: 'SET_STEP', payload: 'workspace-init' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
      console.error('[Onboarding] Error submitting basic info:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerEnrichment = useCallback(async () => {
    if (!state.input.website) return;
    
    try {
      const enriched = await enrichmentService.analyzeWebsite(state.input.website);
      if (enriched) {
        dispatch({ 
          type: 'SET_ENRICHED_PROFILE', 
          payload: { ...enriched, name: state.input.agencyName } as EnrichedAgencyProfile 
        });
      }
    } catch (err) {
      console.warn('[Onboarding] Enrichment failed:', err);
    }
  }, [state.input.website, state.input.agencyName]);

  const initWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      const input = state.input as OnboardingInput;
      const workspace = await initializeWorkspace(input, state.enrichedProfile);
      dispatch({ type: 'SET_WORKSPACE_CONFIG', payload: workspace });
      dispatch({ type: 'SET_STEP', payload: 'first-actions' });
      
      // Persist checklist
      await updateOnboardingProgress(workspaceId, { 
        checklist: workspace.onboardingChecklist 
      });
      
      dispatch({ 
        type: 'UPDATE_PROGRESS', 
        payload: { step: 'workspace-init', percent: 60 } 
      });
    } catch (err) {
      console.error('[Onboarding] Error initializing workspace:', err);
    }
  }, [workspaceId, state.input, state.enrichedProfile]);

  const completeTask = useCallback(async (taskId: string) => {
    dispatch({ type: 'COMPLETE_TASK', payload: taskId });
    
    // Persist checklist update
    if (workspaceId && state.workspaceConfig) {
      try {
        await updateOnboardingProgress(workspaceId, { 
          checklist: state.workspaceConfig.onboardingChecklist 
        });
      } catch (err) {
        console.error('Failed to persist task completion:', err);
      }
    }
  }, [workspaceId, state.workspaceConfig]);

  const finishOnboarding = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      await completeOnboarding(workspaceId);
      dispatch({ type: 'SET_STEP', payload: 'complete' });
      dispatch({ 
        type: 'UPDATE_PROGRESS', 
        payload: { step: 'complete', percent: 100 } 
      });
      
      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      console.error('[Onboarding] Error completing:', err);
    }
  }, [workspaceId, router]);

  const loadExistingWorkspace = useCallback((workspace: WorkspaceRecord) => {
    const config = workspaceToConfig(workspace);
    dispatch({ 
      type: 'LOAD_WORKSPACE', 
      payload: { workspace, config } 
    });
    setWorkspaceId(workspace.id);
  }, []);

  const value: OnboardingContextType = {
    state,
    workspaceId,
    actions: {
      setStep,
      updateInput,
      submitBasicInfo,
      triggerEnrichment,
      initializeWorkspace: initWorkspace,
      completeTask,
      completeOnboarding: finishOnboarding,
      loadExistingWorkspace,
    },
    isLoading,
    error,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
