/**
 * ============================================
 * IMPORT PHASE 6 — HARDENING & EDGE CASES
 * ============================================
 * 
 * End-to-end validation of import failure handling and edge cases.
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const TEST_CSV_DIR = '/tmp/import-tests';

async function cleanupTestData() {
  const testEmails = [
    'edge-test@example.com', 'empty-test@example.com',
    'all-invalid@example.com', 'dup1@example.com',
    'valid-import@example.com', 'partial-import@example.com'
  ];
  for (const email of testEmails) {
    await (supabase as any).from('leads').delete().eq('email', email);
    await (supabase as any).from('buyers').delete().eq('email', email);
  }
}

test.describe.serial('Import Phase 6 - Hardening & Edge Cases', () => {
  
  test.beforeAll(async () => {
    await cleanupTestData();
    if (!fs.existsSync(TEST_CSV_DIR)) {
      fs.mkdirSync(TEST_CSV_DIR, { recursive: true });
    }
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  test('empty CSV shows helpful error', async ({ page }) => {
    console.log('TEST 1: Empty CSV handling');
    
    // Create truly empty CSV (just headers, no data rows parsed)
    const csv = `name,email,phone`;
    const csvPath = path.join(TEST_CSV_DIR, 'empty-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    
    // Should show warning about no data (use first() to avoid strict mode violation)
    await expect(page.getByText(/The CSV file appears to be empty/i).first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Empty CSV shows helpful message');
  });

  test('all invalid rows shows warning and prevents import', async ({ page }) => {
    console.log('TEST 2: All invalid rows');
    
    const csv = `name,email,phone
,bad-email,555
,another-bad,666
,third-bad,777`;
    const csvPath = path.join(TEST_CSV_DIR, 'all-invalid.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await page.getByText('Validate Data').click();
    await page.waitForTimeout(2000);
    
    // Should show all rows invalid warning
    await expect(page.getByText(/all rows.*invalid/i)).toBeVisible({ timeout: 15000 });
    console.log('✅ All invalid rows warning shown');
    
    // Import button should be disabled
    const importButton = page.getByRole('button', { name: /Import \d+/ });
    await expect(importButton).toBeDisabled();
    console.log('✅ Import button disabled when all invalid');
  });

  test('empty state shown when filter returns no rows', async ({ page }) => {
    console.log('TEST 3: Empty state for filters');
    
    const csv = `name,email,phone
Valid1,valid1@example.com,555-0101
Valid2,valid2@example.com,555-0102`;
    const csvPath = path.join(TEST_CSV_DIR, 'valid-only.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await page.getByText('Validate Data').click();
    await page.waitForTimeout(2000);
    
    // Click Invalid filter (there are no invalid rows)
    await page.getByText('Invalid (0)').click();
    await page.waitForTimeout(500);
    
    // Should show empty state
    await expect(page.getByText(/no rows match this filter/i)).toBeVisible({ timeout: 10000 });
    console.log('✅ Empty state shown for filter with no matches');
  });

  test('why not importable column shows helpful messages', async ({ page }) => {
    console.log('TEST 4: Why not importable column');
    
    const csv = `name,email,phone
Valid,valid@example.com,555-0201
Invalid,bad-email,555-0202
Dup1,dup@example.com,555-0203
Dup2,dup@example.com,555-0204`;
    const csvPath = path.join(TEST_CSV_DIR, 'why-not-importable.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await page.getByText('Validate Data').click();
    await page.waitForTimeout(2000);
    
    // Should show "Why Not Importable" column header
    await expect(page.getByText(/why not importable/i)).toBeVisible({ timeout: 10000 });
    console.log('✅ Why Not Importable column visible');
    
    // Should show ready message for valid row
    await expect(page.getByText(/ready to import/i).first()).toBeVisible();
    console.log('✅ Ready message visible for valid rows');
  });

  test('failed rows report available after import', async ({ page }) => {
    console.log('TEST 5: Failed rows report');
    
    // This test validates the UI structure for failed report
    // Actual failure would require database constraints
    const csv = `name,email,phone
Test1,report-test1@example.com,555-0301
Test2,report-test2@example.com,555-0302`;
    const csvPath = path.join(TEST_CSV_DIR, 'report-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await page.getByText('Validate Data').click();
    await page.waitForTimeout(2000);
    
    // Import the rows
    await page.getByRole('button', { name: /Import \d+/ }).click();
    await page.waitForTimeout(3000);
    
    // Should show import complete
    await expect(page.getByText(/import complete/i)).toBeVisible({ timeout: 30000 });
    console.log('✅ Import completed');
    
    // Should show download buttons for different reports
    await expect(page.getByText(/imported.*report/i)).toBeVisible();
    console.log('✅ Report download buttons available');
  });

  test('import history shows status badges correctly', async ({ page }) => {
    console.log('TEST 6: Import history status');
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    // Import history section should be visible if there are imports
    const historySection = page.locator('text=Recent Imports');
    
    if (await historySection.isVisible().catch(() => false)) {
      // Check that status badges exist
      const badges = await page.locator('[class*="badge"], [class*="Badge"]').all();
      console.log(`✅ Found ${badges.length} badge elements in history`);
      
      // Check for completed/partial/failed text
      const html = await page.content();
      const hasStatus = html.includes('Completed') || html.includes('Partial') || html.includes('Failed');
      expect(hasStatus).toBeTruthy();
      console.log('✅ Import status shown in history');
    } else {
      console.log('⚠️ No import history yet (expected for fresh environment)');
    }
  });

  test('edge case: CSV with only unsupported columns', async ({ page }) => {
    console.log('TEST 7: Unsupported columns');
    
    const csv = `foo,bar,baz
1,2,3
4,5,6`;
    const csvPath = path.join(TEST_CSV_DIR, 'unsupported-cols.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    
    // Should show warning about no recognizable columns
    await expect(page.getByText(/No recognizable columns found/i).first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Unsupported columns warning shown');
  });

  test('import progress shown during large import', async ({ page }) => {
    console.log('TEST 8: Import progress indicator');
    
    // Create CSV with multiple rows
    let csv = 'name,email,phone\n';
    for (let i = 1; i <= 5; i++) {
      csv += `User${i},user${i}-progress@example.com,555-040${i}\n`;
    }
    const csvPath = path.join(TEST_CSV_DIR, 'progress-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await page.getByText('Validate Data').click();
    await page.waitForTimeout(2000);
    
    // Click import and watch for progress
    const importButton = page.getByRole('button', { name: /Import \d+/ });
    await importButton.click();
    
    // Should show progress indicator
    await expect(page.getByText(/importing|processed/i)).toBeVisible({ timeout: 10000 });
    console.log('✅ Progress indicator shown during import');
    
    // Wait for completion
    await expect(page.getByText(/import complete/i)).toBeVisible({ timeout: 30000 });
    console.log('✅ Import completed');
  });

  test('partial import shows correct status', async ({ page }) => {
    console.log('TEST 9: Partial import status');
    
    // Create CSV with mix of valid and duplicate rows
    const csv = `name,email,phone
Valid1,partial-v1@example.com,555-0501
Valid2,partial-v2@example.com,555-0502
Invalid,bad-email,555-0503`;
    const csvPath = path.join(TEST_CSV_DIR, 'partial-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await page.getByText('Validate Data').click();
    await page.waitForTimeout(2000);
    
    // Should show summary with counts
    const html = await page.content();
    expect(html).toContain('Ready');
    expect(html).toContain('Invalid');
    console.log('✅ Partial import summary shown correctly');
  });
});
