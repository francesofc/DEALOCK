/**
 * ============================================
 * DEALOCK FULL ONBOARDING WIZARD E2E TEST
 * ============================================
 * 
 * Complete wizard: welcome → basic-info → workspace-init → first-actions → complete
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
);

const TEST_AGENCY = {
  name: 'Wizard Test Agency',
  market: 'Phoenix, AZ',
  userName: 'Wizard Tester',
  userEmail: 'wizard@test.com',
};

test.describe('Full Onboarding Wizard Completion', () => {
  
  test.beforeAll(async () => {
    await (supabase as any).from('workspaces').delete().ilike('agency_name', '%Wizard%');
  });

  test('complete full onboarding wizard through UI', async ({ page }) => {
    console.log('\n=== FULL WIZARD COMPLETION TEST ===\n');
    
    // Step 1: Welcome
    console.log('Step 1: Welcome step...');
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1').filter({ hasText: 'Welcome to Dealock' })).toBeVisible();
    console.log('✅ Welcome step visible');
    
    await page.getByTestId('onboarding-get-started').click();
    
    // Step 2: Basic Info
    console.log('Step 2: Basic Info form...');
    await expect(page.getByText('Tell us about your agency')).toBeVisible();
    
    await page.getByTestId('onboarding-agency-name').fill(TEST_AGENCY.name);
    await page.getByTestId('onboarding-primary-market').fill(TEST_AGENCY.market);
    await page.getByTestId('onboarding-user-name').fill(TEST_AGENCY.userName);
    await page.getByTestId('onboarding-user-email').fill(TEST_AGENCY.userEmail);
    await page.getByRole('button', { name: '2-5 people' }).click();
    await page.getByRole('button', { name: 'Apartments' }).click();
    
    console.log('✅ Form filled');
    
    // Submit - this creates workspace in DB
    await page.getByTestId('onboarding-continue').click();
    console.log('✅ Form submitted, workspace created');
    
    // Step 3: Workspace Init (auto-advances after 2s)
    console.log('Step 3: Workspace initialization...');
    await expect(page.getByText('Setting up your workspace')).toBeVisible({ timeout: 10000 });
    console.log('✅ Workspace init step visible');
    
    // Wait for auto-progression to first-actions
    await expect(page.getByText('Your workspace is ready')).toBeVisible({ timeout: 10000 });
    console.log('✅ First actions step visible');
    
    // Step 4: Complete onboarding
    console.log('Step 4: Completing onboarding...');
    await page.getByRole('button', { name: 'Go to Dealock' }).click();
    
    // Step 5: Verify redirect to dashboard
    console.log('Step 5: Verifying dashboard...');
    await page.waitForURL('/', { timeout: 15000 });
    console.log('✅ Redirected to dashboard');
    
    // Step 6: Verify workspace
    console.log('Step 6: Verifying workspace...');
    await expect(page.getByTestId('workspace-name')).toContainText(TEST_AGENCY.name);
    console.log('✅ Workspace visible:', TEST_AGENCY.name);
    
    // Step 7: Refresh and verify persistence
    console.log('Step 7: Refreshing...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByTestId('workspace-name')).toContainText(TEST_AGENCY.name);
    console.log('✅ Workspace persisted');
    
    // Step 8: Verify settings
    console.log('Step 8: Verifying settings...');
    await page.goto('/settings/agency');
    await expect(page.getByTestId('settings-agency-name')).toHaveValue(TEST_AGENCY.name);
    console.log('✅ Settings correct');
    
    // Step 9: Verify DB state
    console.log('Step 9: Verifying database...');
    const { data: workspace } = await (supabase as any)
      .from('workspaces')
      .select('agency_name,onboarding_status')
      .eq('agency_name', TEST_AGENCY.name)
      .single();
    
    expect(workspace?.onboarding_status).toBe('completed');
    console.log('✅ Database record shows completed');
    
    console.log('\n=== FULL WIZARD COMPLETION TEST PASSED ===\n');
  });
});
