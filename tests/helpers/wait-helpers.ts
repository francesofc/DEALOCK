/**
 * ============================================
 * DEALOCK E2E WAIT HELPERS (Simplified)
 * ============================================
 * 
 * Minimal waiting utilities that work reliably.
 * 
 * Strategy:
 * - Wait for loading spinner to disappear (if present)
 * - Wait for network to be idle
 * - Use data-page-ready attribute as final confirmation
 */

import { Page } from '@playwright/test';

/**
 * Wait for page to be ready for interaction.
 * Waits for spinner to disappear and network to be idle.
 */
export async function waitForPageReady(page: Page, timeout = 30000): Promise<void> {
  // Wait for spinner to disappear (if it appears)
  const spinner = page.locator('[data-testid="loading-spinner"]');
  try {
    await spinner.waitFor({ state: 'visible', timeout: 5000 });
    await spinner.waitFor({ state: 'hidden', timeout: timeout - 5000 });
  } catch {
    // Spinner may not appear or already gone - that's fine
  }
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

/**
 * Navigate to URL and wait for page to be ready
 */
export async function navigateAndWaitForReady(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await waitForPageReady(page);
}

/**
 * Wait for sellers page specifically
 */
export async function waitForSellersPageReady(page: Page): Promise<void> {
  await waitForPageReady(page);
}

/**
 * Wait for buyers page specifically
 */
export async function waitForBuyersPageReady(page: Page): Promise<void> {
  await waitForPageReady(page);
}

/**
 * Wait for match page specifically
 */
export async function waitForMatchPageReady(page: Page): Promise<void> {
  await waitForPageReady(page);
}

/**
 * Wait for buyer detail page specifically
 */
export async function waitForBuyerDetailReady(page: Page): Promise<void> {
  await waitForPageReady(page);
}

/**
 * Wait for seller detail page specifically
 */
export async function waitForSellerDetailReady(page: Page): Promise<void> {
  await waitForPageReady(page);
}
