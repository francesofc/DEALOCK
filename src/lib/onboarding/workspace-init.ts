/**
 * ============================================
 * DEALOCK WORKSPACE INITIALIZATION
 * ============================================
 * 
 * Intelligent workspace setup based on onboarding inputs.
 * Creates a functional commercial cockpit from minimal input.
 */

import { 
  OnboardingInput, 
  EnrichedAgencyProfile, 
  WorkspaceConfig,
  PipelineStageConfig,
  StatusConfig,
  OnboardingTask,
  TeamSize,
  PropertyType
} from '@/types/onboarding';

// ============================================
// WORKSPACE INITIALIZATION ENGINE
// ============================================

export function initializeWorkspace(
  input: OnboardingInput,
  enrichedProfile?: EnrichedAgencyProfile
): WorkspaceConfig {
  const agency = enrichedProfile || createBasicAgencyProfile(input);
  
  return {
    agency,
    pipelineStages: generatePipelineStages(input.teamSize, input.primaryMarket),
    sellerStatuses: generateSellerStatuses(),
    buyerStatuses: generateBuyerStatuses(),
    mandateStatuses: generateMandateStatuses(),
    settings: generateWorkspaceSettings(input),
    onboardingChecklist: generateOnboardingChecklist(input, enrichedProfile),
  };
}

// ============================================
// AGENCY PROFILE CREATION
// ============================================

function createBasicAgencyProfile(input: OnboardingInput): EnrichedAgencyProfile {
  return {
    name: input.agencyName,
    description: generateAgencyDescription(input),
    specialties: inferSpecialties(input),
    propertyTypes: input.propertyTypes.length > 0 
      ? input.propertyTypes 
      : inferPropertyTypes(input.primaryMarket),
    geographicCoverage: [input.primaryMarket],
    enrichmentConfidence: {
      description: 0.3,
      specialties: 0.4,
      coverage: 0.8,
    },
  };
}

function generateAgencyDescription(input: OnboardingInput): string {
  const propertyTypeText = input.propertyTypes.length > 0
    ? input.propertyTypes.join(', ').replace(/,([^,]*)$/, ' and$1')
    : 'premium properties';
  
  return `${input.agencyName} specializes in ${propertyTypeText} in ${input.primaryMarket} and surrounding areas.`;
}

function inferSpecialties(input: OnboardingInput): string[] {
  const specialties: string[] = [];
  
  if (input.propertyTypes.includes('commercial')) {
    specialties.push('commercial real estate');
  }
  if (input.propertyTypes.includes('villa') || input.propertyTypes.includes('penthouse')) {
    specialties.push('luxury properties');
  }
  if (input.teamSize === 'solo') {
    specialties.push('boutique service');
  }
  if (input.propertyTypes.includes('apartment') || input.propertyTypes.includes('house')) {
    specialties.push('residential sales');
  }
  
  return specialties.length > 0 ? specialties : ['real estate services'];
}

function inferPropertyTypes(market: string): PropertyType[] {
  // Default property types based on common markets
  const defaultTypes: PropertyType[] = ['apartment', 'house', 'villa'];
  
  // Could be enhanced with market-specific inference
  const marketLower = market.toLowerCase();
  if (marketLower.includes('lisbon') || marketLower.includes('porto') || marketLower.includes('paris')) {
    return ['apartment', 'penthouse', 'loft', 'house'];
  }
  
  return defaultTypes;
}

// ============================================
// PIPELINE CONFIGURATION
// ============================================

function generatePipelineStages(teamSize: TeamSize, market: string): PipelineStageConfig[] {
  const baseStages: PipelineStageConfig[] = [
    {
      id: 'new',
      name: 'New Lead',
      description: 'Fresh inquiries requiring qualification',
      color: '#94a3b8',
      order: 1,
      isDefault: true,
    },
    {
      id: 'contacted',
      name: 'Contacted',
      description: 'Initial contact made, building rapport',
      color: '#60a5fa',
      order: 2,
      isDefault: false,
    },
    {
      id: 'qualified',
      name: 'Qualified',
      description: 'Serious prospects with clear needs',
      color: '#a78bfa',
      order: 3,
      isDefault: false,
    },
    {
      id: 'proposal',
      name: 'Proposal',
      description: 'Mandate or offer proposals sent',
      color: '#fbbf24',
      order: 4,
      isDefault: false,
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      description: 'Active deal negotiation',
      color: '#f97316',
      order: 5,
      isDefault: false,
    },
    {
      id: 'closing',
      name: 'Closing',
      description: 'Final stages to signed mandate/deal',
      color: '#34d399',
      order: 6,
      isDefault: false,
    },
    {
      id: 'closed',
      name: 'Closed',
      description: 'Signed mandates and completed deals',
      color: '#10b981',
      order: 7,
      isDefault: false,
    },
  ];
  
  // Add team-size specific stages
  if (teamSize === 'medium' || teamSize === 'large') {
    baseStages.splice(3, 0, {
      id: 'review',
      name: 'Team Review',
      description: 'Internal review for high-value opportunities',
      color: '#e879f9',
      order: 3.5,
      isDefault: false,
    });
  }
  
  return baseStages;
}

// ============================================
// STATUS CONFIGURATIONS
// ============================================

function generateSellerStatuses(): StatusConfig[] {
  return [
    { id: 'new', label: 'New', value: 'new', color: '#94a3b8', description: 'Fresh lead, not yet contacted' },
    { id: 'contacted', label: 'Contacted', value: 'contacted', color: '#60a5fa', description: 'Initial contact made' },
    { id: 'qualified', label: 'Qualified', value: 'qualified', color: '#a78bfa', description: 'Serious seller with clear timeline' },
    { id: 'proposal', label: 'Near Mandate', value: 'mandate_proposed', color: '#fbbf24', description: 'Mandate proposal stage' },
    { id: 'signed', label: 'Signed', value: 'mandate_signed', color: '#10b981', description: 'Exclusive mandate signed' },
    { id: 'lost', label: 'Lost', value: 'lost', color: '#ef4444', description: 'Lead lost to competitor' },
  ];
}

function generateBuyerStatuses(): StatusConfig[] {
  return [
    { id: 'browsing', label: 'Browsing', value: 'browsing', color: '#94a3b8', description: 'Early stage, just looking' },
    { id: 'active', label: 'Active', value: 'active', color: '#60a5fa', description: 'Actively searching' },
    { id: 'qualified', label: 'Qualified', value: 'qualified', color: '#a78bfa', description: 'Finance ready, serious intent' },
    { id: 'offer', label: 'Offer Made', value: 'offer_made', color: '#fbbf24', description: 'Submitted offer on property' },
    { id: 'closed', label: 'Closed', value: 'closed', color: '#10b981', description: 'Purchase completed' },
    { id: 'paused', label: 'Paused', value: 'paused', color: '#f97316', description: 'Search temporarily paused' },
  ];
}

function generateMandateStatuses(): StatusConfig[] {
  return [
    { id: 'draft', label: 'Draft', value: 'draft', color: '#94a3b8', description: 'Mandate being prepared' },
    { id: 'sent', label: 'Pending', value: 'sent', color: '#fbbf24', description: 'Sent for signature' },
    { id: 'signed', label: 'Active', value: 'signed', color: '#10b981', description: 'Signed and active' },
    { id: 'expiring', label: 'Expiring', value: 'expiring', color: '#f97316', description: 'Expiring within 30 days' },
    { id: 'expired', label: 'Expired', value: 'expired', color: '#ef4444', description: 'Mandate expired' },
  ];
}

// ============================================
// WORKSPACE SETTINGS
// ============================================

function generateWorkspaceSettings(input: OnboardingInput): WorkspaceConfig['settings'] {
  const marketCurrency = inferCurrency(input.primaryMarket);
  
  return {
    currency: marketCurrency,
    areaUnit: input.primaryMarket.toLowerCase().includes('usa') || 
              input.primaryMarket.toLowerCase().includes('uk') ? 'sqft' : 'm2',
    dateFormat: input.language === 'en' ? 'MM/DD/YYYY' : 'DD/MM/YYYY',
    language: input.language,
    notifications: {
      email: true,
      browser: true,
    },
  };
}

function inferCurrency(market: string): string {
  const marketLower = market.toLowerCase();
  if (marketLower.includes('usa') || marketLower.includes('america')) return 'USD';
  if (marketLower.includes('uk') || marketLower.includes('london')) return 'GBP';
  if (marketLower.includes('switzerland') || marketLower.includes('swiss')) return 'CHF';
  if (marketLower.includes('portugal') || marketLower.includes('lisbon') || 
      marketLower.includes('france') || marketLower.includes('paris') ||
      marketLower.includes('spain') || marketLower.includes('madrid')) return 'EUR';
  return 'EUR'; // Default for most European markets
}

// ============================================
// ONBOARDING CHECKLIST
// ============================================

function generateOnboardingChecklist(
  input: OnboardingInput,
  enrichedProfile?: EnrichedAgencyProfile
): OnboardingTask[] {
  const tasks: OnboardingTask[] = [
    {
      id: 'complete-profile',
      title: 'Complete agency profile',
      description: 'Add logo, team members, and detailed description',
      isRequired: false,
      isCompleted: false,
      estimatedMinutes: 5,
      actionType: 'configure',
      priority: 'recommended',
    },
    {
      id: 'add-first-seller',
      title: 'Add your first seller',
      description: 'Create a seller lead to start tracking',
      isRequired: false,
      isCompleted: false,
      estimatedMinutes: 3,
      actionType: 'create',
      priority: 'critical',
    },
    {
      id: 'add-first-buyer',
      title: 'Add your first buyer',
      description: 'Add a qualified buyer to your database',
      isRequired: false,
      isCompleted: false,
      estimatedMinutes: 3,
      actionType: 'create',
      priority: 'critical',
    },
    {
      id: 'explore-command-center',
      title: 'Explore Command Center',
      description: 'See your daily priorities and pipeline overview',
      isRequired: false,
      isCompleted: false,
      estimatedMinutes: 2,
      actionType: 'explore',
      priority: 'recommended',
    },
  ];
  
  // Add import task if user has existing data
  if (input.hasExistingData) {
    tasks.unshift({
      id: 'import-data',
      title: 'Import existing data',
      description: `Import from ${input.currentCRM || 'your current system'}`,
      isRequired: false,
      isCompleted: false,
      estimatedMinutes: 10,
      actionType: 'import',
      priority: 'critical',
    });
  }
  
  // Add enrichment task if we have a website to analyze
  if (input.website && !enrichedProfile) {
    tasks.push({
      id: 'enrich-profile',
      title: 'Enrich agency profile',
      description: 'AI analysis of your website for auto-complete',
      isRequired: false,
      isCompleted: false,
      estimatedMinutes: 2,
      actionType: 'configure',
      priority: 'optional',
    });
  }
  
  return tasks;
}

// ============================================
// AI ENRICHMENT PLACEHOLDER (Future)
// ============================================

export interface EnrichmentService {
  analyzeWebsite(url: string): Promise<Partial<EnrichedAgencyProfile>>;
  enrichFromPublicData(agencyName: string, market: string): Promise<Partial<EnrichedAgencyProfile>>;
  suggestWorkspaceConfig(profile: EnrichedAgencyProfile): Promise<Partial<WorkspaceConfig>>;
}

// Placeholder implementation - will be replaced with real AI service
export const enrichmentService: EnrichmentService = {
  async analyzeWebsite(url: string): Promise<Partial<EnrichedAgencyProfile>> {
    // TODO: Implement actual website scraping + AI analysis
    console.log('[Enrichment] Website analysis placeholder for:', url);
    return {
      enrichmentConfidence: {
        description: 0.7,
        specialties: 0.6,
        coverage: 0.5,
      },
    };
  },
  
  async enrichFromPublicData(agencyName: string, market: string): Promise<Partial<EnrichedAgencyProfile>> {
    // TODO: Implement public data lookup + AI enrichment
    console.log('[Enrichment] Public data lookup placeholder for:', agencyName, market);
    return {
      enrichmentConfidence: {
        description: 0.4,
        specialties: 0.3,
        coverage: 0.6,
      },
    };
  },
  
  async suggestWorkspaceConfig(profile: EnrichedAgencyProfile): Promise<Partial<WorkspaceConfig>> {
    // TODO: AI-driven workspace suggestions based on profile
    console.log('[Enrichment] Workspace suggestion placeholder for:', profile.name);
    return {};
  },
};
