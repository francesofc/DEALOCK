import { test, expect } from '@playwright/test';
import { ensureTestDataExists } from '../helpers/test-data';
import { waitForMatchPageReady, navigateAndWaitForReady } from '../helpers/wait-helpers';

/**
 * ============================================
 * MANUAL MATCH CREATION E2E TESTS
 * ============================================
 * 
 * Tests the match intelligence page:
 * - Open /match page
 * - Verify page structure
 * - Test manual match drawer
 */

test.describe('Manual Match Creation', () => {
  test.beforeAll(async () => {
    await ensureTestDataExists();
  });

  test.beforeEach(async ({ page }) => {
    await navigateAndWaitForReady(page, '/match');
  });

  test('should display match intelligence page', async ({ page }) => {
    await waitForMatchPageReady(page);
    
    // Verify URL
    await expect(page).toHaveURL('/match');
    
    // Verify header
    const header = page.locator('h1');
    await expect(header).toContainText(/match/i, { timeout: 10000 });
    
    // Verify generate matches button exists
    const generateButton = page.locator('button:has-text("Generate")').first();
    await expect(generateButton).toBeVisible();
  });

  test('should show match page structure', async ({ page }) => {
    await waitForMatchPageReady(page);
    
    // Verify page has match-related content
    const content = await page.content();
    
    const hasMatchRelated = content.match(/match|opportunit|buyer|seller/i);
    expect(hasMatchRelated).toBeTruthy();
  });
});
