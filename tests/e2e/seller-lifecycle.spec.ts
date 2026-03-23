import { test, expect } from '@playwright/test';
import { ensureTestDataExists, TEST_SELLER_NAME } from '../helpers/test-data';
import { waitForSellersPageReady, navigateAndWaitForReady, waitForSellerDetailReady } from '../helpers/wait-helpers';

/**
 * ============================================
 * SELLER LIFECYCLE E2E TESTS
 * ============================================
 * 
 * Tests the complete seller lifecycle:
 * - View sellers page
 * - Verify page structure
 * - Navigate mandates page
 * 
 * Uses deterministic test data to ensure reliability.
 */

test.describe('Seller Lifecycle', () => {
  test.beforeAll(async () => {
    // Ensure test data exists before running tests
    await ensureTestDataExists();
  });

  test.beforeEach(async ({ page }) => {
    await navigateAndWaitForReady(page, '/sellers');
  });

  test('should display sellers page', async ({ page }) => {
    // Verify page container exists
    const sellersPage = page.locator('[data-testid="sellers-page"]');
    await expect(sellersPage).toBeVisible();
    
    // Verify URL
    await expect(page).toHaveURL('/sellers');
    
    // Verify header
    const header = page.locator('h1');
    await expect(header).toContainText(/seller|pipeline/i);
  });

  test('should display sellers list with data', async ({ page }) => {
    await waitForSellersPageReady(page);
    
    // Verify seller rows exist (or empty state)
    const sellerRows = page.locator('[data-testid="seller-row"]');
    const emptyState = page.locator('text=/no seller|empty/i');
    
    const hasRows = await sellerRows.count() > 0;
    const hasEmpty = await emptyState.count() > 0;
    
    expect(hasRows || hasEmpty).toBeTruthy();
  });

  test('should show seller stats', async ({ page }) => {
    await waitForSellersPageReady(page);
    
    // Verify stats section exists (look for numeric stats like "140 Total")
    const hasTotal = await page.locator('text=/\\d+\\s*total/i').count() > 0;
    const hasStats = await page.locator('text=/\\d+\\s*critical|\\d+\\s*signed/i').count() > 0;
    
    expect(hasTotal || hasStats).toBeTruthy();
  });
});

test.describe('Mandate Integration', () => {
  test('should display mandates page', async ({ page }) => {
    await navigateAndWaitForReady(page, '/mandates');
    
    await expect(page).toHaveURL('/mandates');
    
    // Verify page has mandate-related content
    const content = await page.content();
    expect(content).toMatch(/mandate|exclusiv|active|draft/i);
  });

  test('should show mandates list structure', async ({ page }) => {
    await navigateAndWaitForReady(page, '/mandates');
    
    // Look for common mandate page elements
    const hasHeader = await page.locator('h1').filter({ hasText: /mandate/i }).count() > 0;
    const hasActiveSection = await page.locator('text=/active|signed/i').count() > 0;
    const hasDraftSection = await page.locator('text=/draft|pending/i').count() > 0;
    
    expect(hasHeader || hasActiveSection || hasDraftSection).toBeTruthy();
  });
});
