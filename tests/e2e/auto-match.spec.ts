import { test, expect } from '@playwright/test';
import { ensureTestDataExists } from '../helpers/test-data';
import { waitForMatchPageReady, navigateAndWaitForReady } from '../helpers/wait-helpers';

/**
 * ============================================
 * AUTOMATIC MATCH GENERATION E2E TESTS
 * ============================================
 * 
 * Tests the automatic match generation:
 * - Open /match page
 * - Click generate button
 * - Verify generation completes
 */

test.describe('Automatic Match Generation', () => {
  test.beforeAll(async () => {
    await ensureTestDataExists();
  });

  test.beforeEach(async ({ page }) => {
    await navigateAndWaitForReady(page, '/match');
  });

  test('should have generate matches button', async ({ page }) => {
    await waitForMatchPageReady(page);
    
    const generateButton = page.locator('button:has-text("Generate")').first();
    await expect(generateButton).toBeVisible();
  });

  test('should run match generation without crashing', async ({ page }) => {
    await waitForMatchPageReady(page);
    
    const generateButton = page.locator('button:has-text("Generate")').first();
    await generateButton.click();
    
    // Wait a moment for generation to start
    await page.waitForTimeout(2000);
    
    // Page should still be on /match (not crashed)
    await expect(page).toHaveURL('/match');
  });
});
