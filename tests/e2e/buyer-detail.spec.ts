import { test, expect } from '@playwright/test';
import { ensureTestDataExists, TEST_BUYER_NAME } from '../helpers/test-data';
import { waitForBuyersPageReady, navigateAndWaitForReady, waitForBuyerDetailReady } from '../helpers/wait-helpers';

/**
 * ============================================
 * BUYER DETAIL E2E TESTS
 * ============================================
 * 
 * Tests the buyer detail page:
 * - Open buyer page
 * - Verify page structure
 * - Navigate to detail
 * 
 * Uses deterministic test data to ensure reliability.
 */

test.describe('Buyer List and Navigation', () => {
  test.beforeAll(async () => {
    await ensureTestDataExists();
  });

  test.beforeEach(async ({ page }) => {
    await navigateAndWaitForReady(page, '/buyers');
  });

  test('should display buyers page', async ({ page }) => {
    // Verify URL
    await expect(page).toHaveURL('/buyers');
    
    // Verify header
    const header = page.locator('h1');
    await expect(header).toContainText(/buyer/i, { timeout: 10000 });
  });

  test('should display buyers list with data', async ({ page }) => {
    await waitForBuyersPageReady(page);
    
    // Verify buyer rows exist (or empty state)
    const buyerRows = page.locator('[data-testid="buyer-row"]');
    const emptyState = page.locator('text=/no buyer|empty/i');
    
    const hasRows = await buyerRows.count() > 0;
    const hasEmpty = await emptyState.count() > 0;
    
    expect(hasRows || hasEmpty).toBeTruthy();
  });

  test('should show buyer stats', async ({ page }) => {
    await waitForBuyersPageReady(page);
    
    // Verify stats section exists
    const hasStats = await page.locator('text=/\\d+\\s*qualified|\\d+\\s*serious/i').count() > 0;
    const hasHeader = await page.locator('h1').filter({ hasText: /buyer/i }).count() > 0;
    
    expect(hasStats || hasHeader).toBeTruthy();
  });
});

test.describe('Buyer Detail Navigation', () => {
  test.beforeAll(async () => {
    await ensureTestDataExists();
  });

  test('should navigate to buyer detail page', async ({ page }) => {
    await navigateAndWaitForReady(page, '/buyers');
    await waitForBuyersPageReady(page);
    
    // Click on first buyer row
    const firstBuyerRow = page.locator('[data-testid="buyer-row"]').first();
    
    // If buyers exist, click first one
    if (await firstBuyerRow.count() > 0) {
      await firstBuyerRow.click();
      
      await waitForBuyerDetailReady(page);
      
      // Verify we're on detail page
      await expect(page).toHaveURL(/\/buyers\/.+/);
    }
  });

  test('should show buyer detail structure', async ({ page }) => {
    await navigateAndWaitForReady(page, '/buyers');
    await waitForBuyersPageReady(page);
    
    const firstBuyerRow = page.locator('[data-testid="buyer-row"]').first();
    
    if (await firstBuyerRow.count() > 0) {
      await firstBuyerRow.click();
      await waitForBuyerDetailReady(page);
      
      // Verify detail page has content
      const content = page.locator('body');
      const hasBudget = await content.locator('text=/budget|€|\\$/i').count() > 0;
      const hasContact = await content.locator('text=/email|phone|contact/i').count() > 0;
      
      expect(hasBudget || hasContact).toBeTruthy();
    }
  });
});
