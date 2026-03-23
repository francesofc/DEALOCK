/**
 * ============================================
 * DEALOCK E2E SELECTORS
 * ============================================
 * 
 * Centralized selector definitions for E2E tests.
 * Uses data-testid attributes for stability.
 */

export const Selectors = {
  // Navigation
  nav: {
    sellersLink: '[data-testid="nav-sellers"]',
    buyersLink: '[data-testid="nav-buyers"]',
    matchLink: '[data-testid="nav-match"]',
    mandatesLink: '[data-testid="nav-mandates"]',
  },

  // Sellers Page
  sellers: {
    page: '[data-testid="sellers-page"]',
    sellerCard: '[data-testid="seller-card"]',
    sellerName: '[data-testid="seller-name"]',
    sellerStatus: '[data-testid="seller-status"]',
    sellerList: '[data-testid="seller-list"]',
  },

  // Seller Detail
  sellerDetail: {
    page: '[data-testid="seller-detail-page"]',
    ownerName: '[data-testid="seller-owner-name"]',
    statusBadge: '[data-testid="seller-status-badge"]',
    convertToMandateButton: '[data-testid="convert-to-mandate-button"]',
    mandateStatus: '[data-testid="mandate-status"]',
    backButton: '[data-testid="back-button"]',
  },

  // Mandates Page
  mandates: {
    page: '[data-testid="mandates-page"]',
    mandateCard: '[data-testid="mandate-card"]',
    mandateList: '[data-testid="mandates-list"]',
    activeSection: '[data-testid="mandates-active"]',
    draftSection: '[data-testid="mandates-draft"]',
  },

  // Match Page
  match: {
    page: '[data-testid="match-page"]',
    generateMatchesButton: '[data-testid="generate-matches-button"]',
    manualMatchButton: '[data-testid="manual-match-button"]',
    generationSummary: '[data-testid="generation-summary"]',
    matchCard: '[data-testid="match-card"]',
    excellentMatches: '[data-testid="excellent-matches"]',
    goodMatches: '[data-testid="good-matches"]',
  },

  // Manual Match Drawer
  manualMatch: {
    drawer: '[data-testid="manual-match-drawer"]',
    buyerSelect: '[data-testid="buyer-select"]',
    targetTypeMandate: '[data-testid="target-type-mandate"]',
    targetTypeSeller: '[data-testid="target-type-seller"]',
    targetSelect: '[data-testid="target-select"]',
    createButton: '[data-testid="create-match-button"]',
    scoreGood: '[data-testid="score-good"]',
    priorityMedium: '[data-testid="priority-medium"]',
  },

  // Buyer Detail
  buyerDetail: {
    page: '[data-testid="buyer-detail-page"]',
    buyerName: '[data-testid="buyer-name"]',
    matchOpportunities: '[data-testid="match-opportunities"]',
    matchCard: '[data-testid="buyer-match-card"]',
    matchScore: '[data-testid="match-score"]',
    matchStatus: '[data-testid="match-status"]',
    matchBlockers: '[data-testid="match-blockers"]',
    recommendedAction: '[data-testid="recommended-action"]',
  },

  // Common
  common: {
    button: '[data-testid="button"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    emptyState: '[data-testid="empty-state"]',
    toast: '[data-testid="toast"]',
  },
} as const;

/**
 * Generate a data-testid attribute string for use in components
 */
export function testId(id: string): string {
  return `[data-testid="${id}"]`;
}
