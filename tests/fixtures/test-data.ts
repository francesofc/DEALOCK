/**
 * ============================================
 * DEALOCK E2E TEST DATA
 * ============================================
 * 
 * Test data and utilities for E2E tests.
 * These are identifiers for existing data in the test environment.
 */

export const TestData = {
  // Known seller for testing (adjust based on your test database)
  seller: {
    id: process.env.TEST_SELLER_ID || 'test-seller-id',
    name: process.env.TEST_SELLER_NAME || 'Test Seller',
    neighborhood: 'Marais',
    city: 'Paris',
  },

  // Known buyer for testing
  buyer: {
    id: process.env.TEST_BUYER_ID || 'test-buyer-id',
    name: process.env.TEST_BUYER_NAME || 'Test Buyer',
    budgetMin: 500000,
    budgetMax: 1000000,
  },

  // Known mandate for testing
  mandate: {
    id: process.env.TEST_MANDATE_ID || 'test-mandate-id',
    title: 'Test Mandate',
    city: 'Paris',
  },
} as const;

/**
 * Wait utilities for tests
 */
export const wait = {
  short: 500,
  medium: 1500,
  long: 3000,
} as const;

/**
 * Timeout configurations
 */
export const timeouts = {
  navigation: 10000,
  api: 10000,
  animation: 500,
} as const;
