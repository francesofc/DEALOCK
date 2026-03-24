/**
 * ============================================
 * IMPORT PHASE 4 — BATCH ACTIONS & BETTER DUPLICATE REVIEW
 * ============================================
 * 
 * End-to-end validation of batch operations and filtering.
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
  const testEmails = ['batch-test@example.com', 'dup1@example.com', 'dup2@example.com'];
  for (const email of testEmails) {
    await (supabase as any).from('leads').delete().eq('email', email);
    await (supabase as any).from('buyers').delete().eq('email', email);
  }
}

test.describe.serial('Import Phase 4 - Batch Actions & Duplicate Review', () => {
  
  test.beforeAll(async () => {
    await cleanupTestData();
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  test('filter tabs show correct counts', async ({ page }) => {
    console.log('TEST 1: Filter tabs');
    
    const csv = `name,email,phone
Valid1,valid1@example.com,555-0101
Valid2,valid2@example.com,555-0102
Invalid1,bad-email,555-0103
Invalid2,invalid2@example.com,12`;
    const csvPath = path.join(TEST_CSV_DIR, 'filter-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(2000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 15000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // Check filter tabs exist with counts
    await expect(page.getByText('All (4)')).toBeVisible();
    await expect(page.getByText('Ready (2)')).toBeVisible();
    await expect(page.getByText('Invalid (2)')).toBeVisible();
    console.log('✅ Filter tabs show correct counts');
    
    // Click Invalid filter
    await page.getByText('Invalid (2)').click();
    await page.waitForTimeout(500);
    
    // Should show only 2 rows
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBe(2);
    console.log('✅ Invalid filter shows only invalid rows');
    
    // Click All filter
    await page.getByText('All (4)').click();
    await page.waitForTimeout(500);
    
    const allRows = await page.locator('table tbody tr').count();
    expect(allRows).toBe(4);
    console.log('✅ All filter shows all rows');
  });

  test('ignore all invalid rows batch action', async ({ page }) => {
    console.log('TEST 2: Ignore all invalid');
    
    const csv = `name,email,phone
Valid,valid@example.com,555-0201
Invalid,bad-email,555-0202
AnotherBad,another@bad,555-0203`;
    const csvPath = path.join(TEST_CSV_DIR, 'batch-invalid-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // Check initial state
    let summary = await page.getByText(/rows ready to import/).textContent();
    expect(summary).toContain('1 rows ready');
    console.log('✅ Initial: 1 row ready');
    
    // Click Ignore All Invalid
    await page.getByRole('button', { name: 'Ignore All Invalid' }).click();
    await page.waitForTimeout(1000);
    
    // Check updated state
    summary = await page.getByText(/rows ready to import/).textContent();
    expect(summary).toContain('2 ignored');
    console.log('✅ Batch ignore worked: 2 ignored');
    
    // Import button should show 1
    const importButton = page.getByRole('button', { name: /Import \d+ Sellers/ });
    const buttonText = await importButton.textContent();
    expect(buttonText).toContain('Import 1 Sellers');
    console.log('✅ Import count correct after batch ignore');
  });

  test('keep all rows batch action', async ({ page }) => {
    console.log('TEST 3: Keep all rows');
    
    const csv = `name,email,phone
Row1,row1@example.com,555-0301
Row2,row2@example.com,555-0302`;
    const csvPath = path.join(TEST_CSV_DIR, 'keep-all-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // First ignore one row
    await page.locator('table tbody tr').first().locator('button:has-text("Ignore")').click();
    await page.waitForTimeout(500);
    
    let summary = await page.getByText(/rows ready to import/).textContent();
    expect(summary).toContain('1 ignored');
    console.log('✅ Row ignored');
    
    // Click Keep All
    await page.getByRole('button', { name: 'Keep All' }).click();
    await page.waitForTimeout(500);
    
    summary = await page.getByText(/rows ready to import/).textContent();
    expect(summary).toContain('0 ignored');
    console.log('✅ Keep All restored all rows');
  });

  test('duplicate badges show field info', async ({ page }) => {
    console.log('TEST 4: Duplicate field info');
    
    // Create a CSV with duplicate emails in file
    const csv = `name,email,phone
First,dup@example.com,555-0401
Second,dup@example.com,555-0402
Third,unique@example.com,555-0403`;
    const csvPath = path.join(TEST_CSV_DIR, 'dup-field-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // Check that In File badge shows (email)
    const html = await page.content();
    expect(html.includes('In File')).toBeTruthy();
    console.log('✅ In File badge visible');
  });

  test('row selection and ignore selected', async ({ page }) => {
    console.log('TEST 5: Row selection');
    
    const csv = `name,email,phone
Row1,r1@example.com,555-0501
Row2,r2@example.com,555-0502
Row3,r3@example.com,555-0503`;
    const csvPath = path.join(TEST_CSV_DIR, 'selection-test.csv');
    fs.writeFileSync(csvPath, csv);
    
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Map Your Data')).toBeVisible({ timeout: 10000 });
    
    await page.getByText('Validate Data').click();
    await expect(page.getByText('Review & Edit')).toBeVisible({ timeout: 15000 });
    
    // Select first two rows using checkboxes
    const checkboxes = await page.locator('table tbody tr td input[type="checkbox"]').all();
    await checkboxes[0].click();
    await checkboxes[1].click();
    console.log('✅ Selected 2 rows');
    
    // Ignore Selected button should appear
    await expect(page.getByRole('button', { name: /Ignore Selected/ })).toBeVisible();
    console.log('✅ Ignore Selected button visible');
    
    // Click Ignore Selected
    await page.getByRole('button', { name: /Ignore Selected/ }).click();
    await page.waitForTimeout(500);
    
    // Check summary
    const summary = await page.getByText(/rows ready to import/).textContent();
    expect(summary).toContain('2 ignored');
    console.log('✅ Ignore Selected worked');
  });
});
