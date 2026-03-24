/**
 * ============================================
 * DEALOCK ONBOARDING TYPES
 * ============================================
 * 
 * Type definitions for AI-assisted onboarding and workspace initialization.
 */

// ============================================
// ONBOARDING INPUT
// ============================================

export interface OnboardingInput {
  // Required
  agencyName: string;
  primaryMarket: string;
  userName: string;
  userEmail: string;
  
  // Optional
  website?: string;
  phone?: string;
  teamSize: TeamSize;
  currentCRM?: string;
  hasExistingData: boolean;
  
  // Preferences
  language: 'en' | 'fr' | 'pt' | 'es';
  propertyTypes: PropertyType[];
}

export type TeamSize = 'solo' | 'small' | 'medium' | 'large';

export type PropertyType = 
  | 'apartment' 
  | 'house' 
  | 'villa' 
  | 'penthouse'
  | 'loft'
  | 'commercial'
  | 'land'
  | 'building';

// ============================================
// ENRICHED AGENCY PROFILE (AI/Scraping)
// ============================================

export interface EnrichedAgencyProfile {
  // Core identity
  name: string;
  description?: string;
  tagline?: string;
  
  // Contact
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  
  // Market positioning
  specialties: string[];
  propertyTypes: PropertyType[];
  geographicCoverage: string[];
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Brand assets (inferred or uploaded)
  logoUrl?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
  };
  
  // Confidence scores for enrichment
  enrichmentConfidence: {
    description: number;
    specialties: number;
    coverage: number;
  };
}

// ============================================
// WORKSPACE INITIALIZATION
// ============================================

export interface WorkspaceConfig {
  // Agency identity
  agency: EnrichedAgencyProfile;
  
  // Pipeline structure
  pipelineStages: PipelineStageConfig[];
  
  // Status configurations
  sellerStatuses: StatusConfig[];
  buyerStatuses: StatusConfig[];
  mandateStatuses: StatusConfig[];
  
  // Default settings
  settings: WorkspaceSettings;
  
  // First actions
  onboardingChecklist: OnboardingTask[];
}

export interface PipelineStageConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface StatusConfig {
  id: string;
  label: string;
  value: string;
  color: string;
  description?: string;
}

export interface WorkspaceSettings {
  currency: string;
  areaUnit: 'm2' | 'sqft';
  dateFormat: string;
  language: string;
  notifications: {
    email: boolean;
    browser: boolean;
  };
}

// ============================================
// ONBOARDING FLOW STATE
// ============================================

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  estimatedMinutes: number;
  actionType: 'import' | 'create' | 'configure' | 'explore';
  priority: 'critical' | 'recommended' | 'optional';
}

export interface OnboardingState {
  step: OnboardingStep;
  input: Partial<OnboardingInput>;
  enrichedProfile?: EnrichedAgencyProfile;
  workspaceConfig?: WorkspaceConfig;
  progress: {
    completedSteps: OnboardingStep[];
    overallPercent: number;
  };
}

export type OnboardingStep = 
  | 'welcome'
  | 'basic-info'
  | 'enrichment'
  | 'workspace-init'
  | 'data-import'
  | 'first-actions'
  | 'complete';

// ============================================
// IMPORT / MIGRATION
// ============================================

export interface ImportSource {
  type: 'csv' | 'excel' | 'api' | 'manual';
  name: string;
  description: string;
  supportedEntities: ('leads' | 'buyers' | 'mandates' | 'activities')[];
}

export interface ImportPreview {
  source: ImportSource;
  entityType: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  sampleRecords: unknown[];
  fieldMappings: FieldMapping[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  confidence: number;
  isMapped: boolean;
}

// ============================================
// AI ENRICHMENT PLACEHOLDER (Future)
// ============================================

export interface AIEnrichmentRequest {
  agencyName: string;
  website?: string;
  primaryMarket: string;
  signalTypes: EnrichmentSignalType[];
}

export type EnrichmentSignalType = 
  | 'description'
  | 'specialties'
  | 'coverage'
  | 'price-range'
  | 'brand-assets'
  | 'team-info';

export interface AIEnrichmentResult {
  agencyProfile: Partial<EnrichedAgencyProfile>;
  signals: EnrichmentSignal[];
  confidence: number;
  suggestedActions: string[];
}

export interface EnrichmentSignal {
  type: EnrichmentSignalType;
  value: unknown;
  confidence: number;
  source: 'website' | 'public-data' | 'inference' | 'user';
}
