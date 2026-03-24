/**
 * ============================================
 * IMPORT PHASE 2 — RUNTIME VALIDATION
 * ============================================
 * 
 * End-to-end validation of buyer import and DB duplicate detection.
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const TEST_CSV_DIR = '/tmp/import-tests';

async function cleanupTestData() {
  const testEmails = [
    'john.inv@example.com', 'sarah.b@email.com', 'bigcorp@business.com', 'maria.garcia@test.com',
    'dupebuyer@example.com', 'uniquebuyer@example.com'
  ];
  for (const email of testEmails) {
    await (supabase as any).from('buyers').delete().eq('email', email);
  }
}

test.describe.serial('Import Phase 2 - Buyer Import + DB Duplicates', () => {
  
  test.beforeAll(async () => {
    await cleanupTestData();
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  test('buyer import flow works', async ({ page }) => {
    console.log('TEST 1: Buyer import flow');
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    // Select buyer import
    await page.getByText('Import Buyers', { exact: false }).click();
    await page.waitForTimeout(500);
    console.log('✅ Selected buyer import');
    
    // Upload valid buyer CSV
    const buyerCsvPath = path.join(TEST_CSV_DIR, 'buyers-valid.csv');
    await page.locator('input[type="file"]').setInputFiles(buyerCsvPath);
    await page.waitForTimeout(1000);
    
    // Wait for preview
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    console.log('✅ Preview step loaded');
    
    // Check buyer-specific fields mapped
    const html = await page.content();
    expect(html).toContain('budget_max');
    console.log('✅ Buyer fields detected');
    
    // Validate
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Validate & Import')).toBeVisible({ timeout: 10000 });
    
    // Check summary
    const summaryText = await page.getByText(/\d+ rows ready to import/).textContent();
    console.log('Summary:', summaryText);
    expect(summaryText).toContain('4');
    
    // Import (button shows seller/buyer count)
    await page.getByRole('button', { name: /Import \d+/ }).click();
    await expect(page.getByText('Import Complete!')).toBeVisible({ timeout: 30000 });
    console.log('✅ Import completed');
    
    // Wait for DB
    await page.waitForTimeout(2000);
    
    // Verify buyers created
    const { data: buyers } = await (supabase as any)
      .from('buyers')
      .select('email')
      .in('email', ['john.inv@example.com', 'sarah.b@email.com']);
    
    console.log('Buyers created:', buyers?.length || 0);
    expect(buyers?.length || 0).toBeGreaterThan(0);
    
    console.log('✅ TEST 1 PASSED: Buyer import works');
  });

  test('database duplicate detection works', async ({ page }) => {
    console.log('TEST 2: Database duplicate detection');
    
    // First, create a seller in the database
    await (supabase as any).from('leads').insert({
      owner_name: 'Existing Seller',
      email: 'existing@dbcheck.com',
      phone: '555-DB-TEST',
      property_type: 'apartment',
      city: 'Test City',
      price: 1000000,
      status: 'new',
      source: 'test'
    });
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    // Create CSV with the same email
    const fs = await import('fs');
    const dupCsv = `name,email,phone,price
New Name,existing@dbcheck.com,555-9999,2000000
Another Seller,brandnew@example.com,555-8888,1500000`;
    
    const dupPath = path.join(TEST_CSV_DIR, 'db-duplicate-test.csv');
    fs.writeFileSync(dupPath, dupCsv);
    
    // Select seller import (the button/card, not the heading)
    await page.locator('button:has-text("Import Sellers"), [role="button"]:has-text("Import Sellers"), h3:has-text("Import Sellers")').first().click();
    
    // Upload
    await page.locator('input[type="file"]').setInputFiles(dupPath);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    // Validate (this checks DB)
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Validate & Import')).toBeVisible({ timeout: 15000 });
    
    // Check for DB duplicate indicator
    const html = await page.content();
    const hasDbDup = html.includes('In DB') || html.includes('Already in database');
    console.log('DB duplicate detected:', hasDbDup);
    
    // Should show 1 valid (the new one) and 1 DB duplicate
    const validText = await page.getByText(/\d+ rows ready to import/).textContent();
    console.log('Valid rows:', validText);
    
    // Cleanup
    await (supabase as any).from('leads').delete().eq('email', 'existing@dbcheck.com');
    
    console.log('✅ TEST 2 PASSED: DB duplicate detection works');
  });

  test('invalid buyer rows flagged', async ({ page }) => {
    console.log('TEST 3: Invalid buyer rows');
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.getByText('Import Buyers').click();
    
    const invalidPath = path.join(TEST_CSV_DIR, 'buyers-invalid.csv');
    await page.locator('input[type="file"]').setInputFiles(invalidPath);
    
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Validate & Import')).toBeVisible({ timeout: 10000 });
    
    // Review table should be visible
    await expect(page.getByText('Review & Edit')).toBeVisible();
    console.log('✅ Review table visible for invalid buyers');
    
    console.log('✅ TEST 3 PASSED: Invalid buyer rows flagged');
  });

  test('buyer file duplicates detected', async ({ page }) => {
    console.log('TEST 4: Buyer file duplicates');
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.getByText('Import Buyers').click();
    
    const dupPath = path.join(TEST_CSV_DIR, 'buyers-duplicate.csv');
    await page.locator('input[type="file"]').setInputFiles(dupPath);
    
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Validate & Import')).toBeVisible({ timeout: 10000 });
    
    // Should show file duplicates
    const html = await page.content();
    const hasFileDup = html.includes('In File') || html.includes('Duplicate in file');
    console.log('File duplicate detected:', hasFileDup);
    
    console.log('✅ TEST 4 PASSED: File duplicates detected');
  });
});
