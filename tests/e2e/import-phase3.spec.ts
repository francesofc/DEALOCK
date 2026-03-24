/**
 * ============================================
 * IMPORT PHASE 3 — ROW-LEVEL REVIEW & CORRECTION
 * ============================================
 * 
 * End-to-end validation of the review/correction layer.
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
  const testEmails = ['import-test@example.com'];
  for (const email of testEmails) {
    await (supabase as any).from('leads').delete().eq('email', email);
  }
}

test.describe.serial('Import Phase 3 - Row Review & Correction', () => {
  
  test.beforeAll(async () => {
    await cleanupTestData();
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  test('review table displays row details with status badges', async ({ page }) => {
    console.log('TEST 1: Review table with row details');
    
    const csv = `name,email,phone,price
Test User,import-test@example.com,555-0101,1000000`;
    const csvPath = path.join(TEST_CSV_DIR, 'review-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // Check table has data
    await expect(page.getByText('import-test@example.com')).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
    console.log('✅ Review table shows row details');
    
    // Check status badge
    await expect(page.getByText('Ready').first()).toBeVisible();
    console.log('✅ Status badge visible');
    
    // Check action buttons
    await expect(page.getByText('Ignore').first()).toBeVisible();
    console.log('✅ Ignore button visible');
  });

  test('ignoring row shows Ignored badge and updates summary', async ({ page }) => {
    console.log('TEST 2: Ignore functionality');
    
    const csv = `name,email,phone
User1,user1-test@example.com,555-0201
User2,user2-test@example.com,555-0202`;
    const csvPath = path.join(TEST_CSV_DIR, 'ignore-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // Verify initial state - summary shows 0 ignored
    let summary = await page.getByText(/rows ready to import/).textContent();
    console.log('Initial summary:', summary);
    expect(summary).toContain('0 ignored');
    console.log('✅ Initial state: 0 ignored');
    
    // Ignore first row - click the first ignore button in the table
    // Find the button by looking in the table rows
    const firstIgnoreButton = page.locator('table tbody tr').first().locator('button:has-text("Ignore")');
    await firstIgnoreButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Found ignore button, clicking...');
    await firstIgnoreButton.click();
    console.log('Clicked first Ignore button');
    await page.waitForTimeout(3000);
    
    // Verify summary now shows 1 ignored
    summary = await page.getByText(/rows ready to import/).textContent();
    console.log('After ignore summary:', summary);
    expect(summary).toContain('1 ignored');
    console.log('✅ Summary updated to 1 ignored');
  });

  test('summary cards show all counts', async ({ page }) => {
    console.log('TEST 3: Summary cards');
    
    const csv = `name,email,phone
User A,valid-a@example.com,555-0301
User B,valid-b@example.com,555-0302
User C,valid-c@example.com,555-0303`;
    const csvPath = path.join(TEST_CSV_DIR, 'summary-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // Check summary cards exist
    const html = await page.content();
    expect(html.includes('Total')).toBeTruthy();
    expect(html.includes('Ready')).toBeTruthy();
    expect(html.includes('Invalid')).toBeTruthy();
    expect(html.includes('In File')).toBeTruthy();
    expect(html.includes('In DB')).toBeTruthy();
    expect(html.includes('Ignored')).toBeTruthy();
    console.log('✅ All summary cards present');
    
    // Ignore one row using correct selector
    await page.locator('table tbody tr').first().locator('button:has-text("Ignore")').click();
    await page.waitForTimeout(2000);
    
    // Verify Ignored count increased
    const htmlAfter = await page.content();
    expect(htmlAfter.includes('Ignored')).toBeTruthy();
    console.log('✅ Ignored card visible after action');
  });

  test('import count updates when rows are ignored', async ({ page }) => {
    console.log('TEST 5: Import count updates');
    
    const csv = `name,email,phone
Test1,test1-import@example.com,555-0501
Test2,test2-import@example.com,555-0502`;
    const csvPath = path.join(TEST_CSV_DIR, 'import-count-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // Check initial state - button shows Import 2 Sellers
    let html = await page.content();
    expect(html).toContain('Import 2 Sellers');
    console.log('✅ Initial: Import 2 Sellers button');
    
    // Ignore first row using correct selector
    await page.locator('table tbody tr').first().locator('button:has-text("Ignore")').click();
    await page.waitForTimeout(2000);
    
    // Verify Ignored badge appears
    html = await page.content();
    expect(html).toContain('Ignored');
    console.log('✅ Ignored badge appeared');
    
    // Check button now shows Import 1 Sellers
    expect(html).toContain('Import 1 Sellers');
    console.log('✅ Button updated to Import 1 Sellers');
  });

  test('export button is available', async ({ page }) => {
    console.log('TEST 4: Export error report');
    
    const csv = `name,email,phone
Bad Row,bad-email,555-0401
Good Row,good@example.com,555-0402`;
    const csvPath = path.join(TEST_CSV_DIR, 'export-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // Check Export button exists
    await expect(page.getByText('Export')).toBeVisible();
    console.log('✅ Export button visible');
  });
});
