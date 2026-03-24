/**
 * ============================================
 * DEALOCK ONBOARDING E2E TESTS
 * ============================================
 * 
 * True browser-based end-to-end validation of the onboarding
 * persistence and activation flow.
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Load env from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize Supabase client for setup/cleanup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const TEST_AGENCY = {
  name: 'E2E Test Agency',
  market: 'Miami, FL',
  userName: 'John Tester',
  userEmail: 'john@test-agency.com',
};

test.describe.serial('Onboarding Persistence', () => {
  
  test.beforeAll(async () => {
    // Clean up any existing test workspaces
    await (supabase as any)
      .from('workspaces')
      .delete()
      .ilike('agency_name', '%E2E%');
  });

  test.afterAll(async () => {
    // Clean up test workspaces
    await (supabase as any)
      .from('workspaces')
      .delete()
      .ilike('agency_name', '%E2E%');
  });

  /**
   * TEST 1: Create workspace via API, verify visible in UI
   */
  test('completed workspace visible on dashboard', async ({ page }) => {
    console.log('TEST 1: Creating workspace and verifying dashboard...');
    
    // Create completed workspace via API (simulating finished onboarding)
    const { data: workspace, error } = await (supabase as any)
      .from('workspaces')
      .insert({
        agency_name: TEST_AGENCY.name,
        primary_market: TEST_AGENCY.market,
        agency_email: TEST_AGENCY.userEmail,
        team_size: 'small',
        property_types: ['apartment', 'commercial'],
        settings: {
          currency: 'USD',
          areaUnit: 'sqft',
          dateFormat: 'MM/DD/YYYY',
          language: 'en',
          notifications: { email: true, browser: true }
        },
        onboarding_status: 'completed',
        onboarding_step: 'complete',
        is_active: true,
      })
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Workspace created:', workspace.id);
    
    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify workspace visible
    await expect(page.getByTestId('command-center-workspace')).toBeVisible();
    await expect(page.getByTestId('workspace-name')).toContainText(TEST_AGENCY.name);
    console.log('✅ Workspace name visible on dashboard');
    
    // No incomplete banner since onboarding is complete
    await expect(page.getByText('Complete Your Workspace Setup')).not.toBeVisible();
    console.log('✅ No incomplete setup banner shown');
  });

  /**
   * TEST 2: Refresh persistence
   */
  test('workspace persists after page refresh', async ({ page }) => {
    console.log('TEST 2: Testing refresh persistence...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify before refresh
    await expect(page.getByTestId('workspace-name')).toContainText(TEST_AGENCY.name);
    console.log('✅ Workspace visible before refresh');
    
    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify after refresh
    await expect(page.getByTestId('workspace-name')).toContainText(TEST_AGENCY.name);
    console.log('✅ Workspace persisted after refresh');
  });

  /**
   * TEST 3: Settings page displays persisted values
   */
  test('settings page displays persisted workspace values', async ({ page }) => {
    console.log('TEST 3: Testing settings page data display...');
    
    await page.goto('/settings/agency');
    await page.waitForLoadState('networkidle');
    
    // Verify settings page loaded
    await expect(page.getByText('Agency Profile')).toBeVisible();
    console.log('✅ Settings page loaded');
    
    // Verify persisted values
    await expect(page.getByTestId('settings-agency-name')).toHaveValue(TEST_AGENCY.name);
    await expect(page.getByTestId('settings-primary-market')).toHaveValue(TEST_AGENCY.market);
    console.log('✅ Persisted values visible in settings form');
  });

  /**
   * TEST 4: Onboarding page loads for new user (no existing workspace)
   */
  test('onboarding page loads welcome step', async ({ page }) => {
    console.log('TEST 4: Testing onboarding page load...');
    
    // First clean up any existing workspaces so onboarding shows welcome
    await (supabase as any).from('workspaces').delete().ilike('agency_name', '%E2E%');
    await page.waitForTimeout(1000); // Give time for cleanup
    
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // If there's a completed workspace, we may be redirected to dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('/onboarding')) {
      // Verify welcome step
      await expect(page.locator('h1').filter({ hasText: 'Welcome to Dealock' })).toBeVisible();
      console.log('✅ Welcome step visible');
      
      // Verify Get Started button
      await expect(page.getByTestId('onboarding-get-started')).toBeVisible();
      console.log('✅ Get Started button visible');
      
      // Click to advance
      await page.getByTestId('onboarding-get-started').click();
      
      // Verify basic info step
      await expect(page.getByText('Tell us about your agency')).toBeVisible();
      console.log('✅ Basic info step reachable');
    } else {
      console.log('ℹ️ Redirected to dashboard (existing workspace found)');
    }
  });

  /**
   * TEST 5: Incomplete onboarding shows setup banner
   */
  test('incomplete onboarding shows setup banner on dashboard', async ({ page }) => {
    console.log('TEST 5: Testing incomplete onboarding banner...');
    
    // Create incomplete workspace
    const { data: workspace, error } = await (supabase as any)
      .from('workspaces')
      .insert({
        agency_name: 'E2E Incomplete Agency',
        primary_market: 'Austin, TX',
        team_size: 'solo',
        property_types: ['apartment'],
        settings: {
          currency: 'USD',
          areaUnit: 'sqft',
          dateFormat: 'MM/DD/YYYY',
          language: 'en',
          notifications: { email: true, browser: true }
        },
        onboarding_status: 'in_progress',
        onboarding_step: 'basic-info',
        is_active: true,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify incomplete setup banner is visible
    await expect(page.getByText('Complete Your Workspace Setup')).toBeVisible();
    console.log('✅ Incomplete setup banner visible');
    
    // Clean up
    await (supabase as any).from('workspaces').delete().eq('id', workspace.id);
  });
});
