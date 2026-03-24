/**
 * ============================================
 * DEALOCK WORKSPACE SERVICE
 * ============================================
 * 
 * Persistence layer for workspace configuration and onboarding state.
 * Real Supabase integration for production data.
 */

import { createClient } from '@/lib/supabase/client';
import { 
  WorkspaceConfig, 
  OnboardingInput, 
  OnboardingTask,
  OnboardingStep,
  EnrichedAgencyProfile 
} from '@/types/onboarding';
import { Workspace, WorkspaceActivity } from '@/types/database';

const supabase = createClient();

// Typed table helpers (cast to any until Supabase types are regenerated)
const workspacesTable = () => (supabase as any).from('workspaces');
const activitiesTable = () => (supabase as any).from('workspace_activities');

// Track if we've already shown the table missing warning
let hasShownTableWarning = false;

function showTableWarning() {
  if (!hasShownTableWarning && typeof window !== 'undefined') {
    hasShownTableWarning = true;
    console.warn(
      '[Workspace] The workspaces table does not exist in Supabase.\n' +
      'Run the SQL in supabase/schema.sql or use:\n' +
      'node scripts/setup-workspace-tables.js'
    );
  }
}

// ============================================
// WORKSPACE CRUD OPERATIONS
// ============================================

export type WorkspaceRecord = Workspace

/**
 * Check if workspaces table exists
 */
async function checkTableExists(): Promise<boolean> {
  try {
    const { error } = await workspacesTable()
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      showTableWarning();
      return false;
    }
    return !error;
  } catch {
    return false;
  }
}

/**
 * Get or create the active workspace
 * In single-workspace mode (pilot phase), returns the first active workspace
 */
export async function getActiveWorkspace(): Promise<WorkspaceRecord | null> {
  if (!(await checkTableExists())) {
    return null;
  }

  try {
    const { data, error } = await workspacesTable()
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No workspace found
        return null;
      }
      console.error('[Workspace] Error fetching workspace:', error);
      throw error;
    }

    return data as WorkspaceRecord;
  } catch (error) {
    console.error('[Workspace] Error in getActiveWorkspace:', error);
    return null;
  }
}

/**
 * Create a new workspace from onboarding input
 */
export async function createWorkspace(input: OnboardingInput): Promise<WorkspaceRecord> {
  if (!(await checkTableExists())) {
    throw new Error(
      'Workspaces table does not exist. Please run the setup SQL in Supabase.'
    );
  }

  const insertData: Partial<Workspace> = {
    agency_name: input.agencyName,
    agency_website: input.website || undefined,
    agency_email: input.userEmail,
    agency_phone: input.phone || undefined,
    primary_market: input.primaryMarket,
    team_size: input.teamSize,
    property_types: input.propertyTypes,
    settings: {
      currency: inferCurrency(input.primaryMarket),
      areaUnit: input.primaryMarket.toLowerCase().includes('usa') || 
                input.primaryMarket.toLowerCase().includes('uk') ? 'sqft' : 'm2',
      dateFormat: input.language === 'en' ? 'MM/DD/YYYY' : 'DD/MM/YYYY',
      language: input.language,
      notifications: {
        email: true,
        browser: true,
      },
    },
    onboarding_status: 'in_progress',
    onboarding_step: 'basic-info',
    is_active: true,
  };

  const { data, error } = await workspacesTable()
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[Workspace] Error creating workspace:', error);
    throw error;
  }

  return data as WorkspaceRecord;
}

/**
 * Update workspace onboarding progress
 */
export async function updateOnboardingProgress(
  workspaceId: string,
  updates: {
    step?: OnboardingStep;
    status?: 'not_started' | 'in_progress' | 'completed';
    checklist?: OnboardingTask[];
    completedAt?: Date;
  }
): Promise<void> {
  if (!(await checkTableExists())) {
    console.warn('[Workspace] Cannot update progress - table does not exist');
    return;
  }

  const updateData: Partial<Workspace> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.step) {
    updateData.onboarding_step = updates.step;
  }
  if (updates.status) {
    updateData.onboarding_status = updates.status;
  }
  if (updates.checklist) {
    updateData.onboarding_checklist = updates.checklist as any[];
  }
  if (updates.completedAt) {
    updateData.onboarding_completed_at = updates.completedAt.toISOString();
  }

  const { error } = await workspacesTable()
    .update(updateData)
    .eq('id', workspaceId);

  if (error) {
    console.error('[Workspace] Error updating onboarding progress:', error);
    throw error;
  }
}

/**
 * Update workspace agency profile
 */
export async function updateWorkspaceProfile(
  workspaceId: string,
  profile: {
    agencyName?: string;
    agencyDescription?: string;
    agencyWebsite?: string;
    agencyEmail?: string;
    agencyPhone?: string;
    primaryMarket?: string;
    logoUrl?: string;
    primaryColor?: string;
  }
): Promise<void> {
  if (!(await checkTableExists())) {
    throw new Error('Workspaces table does not exist');
  }

  const updateData: Partial<Workspace> = {
    updated_at: new Date().toISOString(),
  };

  if (profile.agencyName) updateData.agency_name = profile.agencyName;
  if (profile.agencyDescription) updateData.agency_description = profile.agencyDescription;
  if (profile.agencyWebsite) updateData.agency_website = profile.agencyWebsite;
  if (profile.agencyEmail) updateData.agency_email = profile.agencyEmail;
  if (profile.agencyPhone) updateData.agency_phone = profile.agencyPhone;
  if (profile.primaryMarket) updateData.primary_market = profile.primaryMarket;
  if (profile.logoUrl) updateData.logo_url = profile.logoUrl;
  if (profile.primaryColor) updateData.primary_color = profile.primaryColor;

  const { error } = await workspacesTable()
    .update(updateData)
    .eq('id', workspaceId);

  if (error) {
    console.error('[Workspace] Error updating profile:', error);
    throw error;
  }
}

/**
 * Complete onboarding and activate workspace
 */
export async function completeOnboarding(workspaceId: string): Promise<void> {
  if (!(await checkTableExists())) {
    console.warn('[Workspace] Cannot complete onboarding - table does not exist');
    return;
  }

  const { error } = await workspacesTable()
    .update({
      onboarding_status: 'completed',
      onboarding_step: 'complete',
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', workspaceId);

  if (error) {
    console.error('[Workspace] Error completing onboarding:', error);
    throw error;
  }

  // Log the activity (best effort)
  try {
    await logWorkspaceActivity(workspaceId, 'onboarding_completed', {});
  } catch {
    // Ignore logging errors
  }
}

/**
 * Log workspace activity
 */
export async function logWorkspaceActivity(
  workspaceId: string,
  activityType: string,
  activityData: Record<string, unknown>,
  performedBy?: string
): Promise<void> {
  if (!(await checkTableExists())) {
    return;
  }

  const { error } = await activitiesTable()
    .insert({
      workspace_id: workspaceId,
      activity_type: activityType,
      activity_data: activityData,
      performed_by: performedBy,
    });

  if (error) {
    console.error('[Workspace] Error logging activity:', error);
    // Don't throw - logging failures shouldn't break the flow
  }
}

// ============================================
// CHECK ONBOARDING STATE
// ============================================

export interface OnboardingCheckResult {
  needsOnboarding: boolean;
  workspace?: WorkspaceRecord;
  canResume: boolean;
  currentStep?: OnboardingStep;
}

/**
 * Check if user needs onboarding
 */
export async function checkOnboardingState(): Promise<OnboardingCheckResult> {
  try {
    const workspace = await getActiveWorkspace();

    if (!workspace) {
      // No workspace exists - needs full onboarding
      return {
        needsOnboarding: true,
        canResume: false,
      };
    }

    if (workspace.onboarding_status === 'completed') {
      // Onboarding complete
      return {
        needsOnboarding: false,
        workspace,
        canResume: false,
      };
    }

    // Onboarding in progress - can resume
    return {
      needsOnboarding: true,
      workspace,
      canResume: true,
      currentStep: workspace.onboarding_step as OnboardingStep,
    };
  } catch (error) {
    console.error('[Workspace] Error checking onboarding state:', error);
    // Default to needing onboarding on error
    return {
      needsOnboarding: true,
      canResume: false,
    };
  }
}

// ============================================
// CONVERTERS
// ============================================

/**
 * Convert workspace record to workspace config
 */
export function workspaceToConfig(workspace: WorkspaceRecord): WorkspaceConfig {
  return {
    agency: {
      name: workspace.agency_name,
      description: workspace.agency_description,
      website: workspace.agency_website,
      email: workspace.agency_email,
      phone: workspace.agency_phone,
      geographicCoverage: [workspace.primary_market],
      propertyTypes: workspace.property_types as any[],
      specialties: (workspace.enrichment_data as any)?.specialties || [],
      enrichmentConfidence: {
        description: (workspace.enrichment_data as any)?.description ? 0.7 : 0.3,
        specialties: (workspace.enrichment_data as any)?.specialties ? 0.6 : 0.3,
        coverage: 0.8,
      },
    },
    pipelineStages: [], // Generated dynamically
    sellerStatuses: [],
    buyerStatuses: [],
    mandateStatuses: [],
    settings: workspace.settings as WorkspaceConfig['settings'],
    onboardingChecklist: workspace.onboarding_checklist as OnboardingTask[] || [],
  };
}

// ============================================
// HELPERS
// ============================================

function inferCurrency(market: string): string {
  const marketLower = market.toLowerCase();
  if (marketLower.includes('usa') || marketLower.includes('america')) return 'USD';
  if (marketLower.includes('uk') || marketLower.includes('london')) return 'GBP';
  if (marketLower.includes('switzerland') || marketLower.includes('swiss')) return 'CHF';
  return 'EUR';
}
