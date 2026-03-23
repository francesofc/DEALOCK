/**
 * ============================================
 * DEALOCK DETERMINISTIC TEST DATA HELPERS
 * ============================================
 * 
 * Minimal test data setup for E2E tests.
 * Uses deterministic IDs for natural idempotency.
 * 
 * Strategy:
 * - Use fixed UUIDs for test records (idempotent by design)
 * - Upsert pattern handles concurrent creation safely
 * - Multiple workers = same IDs = no duplicates
 */

import { createClient } from '@supabase/supabase-js';
import { Buyer, Lead, Mandate, FinanceProfile } from '@/types/database';

// Load env vars from .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use the same Supabase config as the app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Create a server-side Supabase client for test setup
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// ============================================
// DETERMINISTIC TEST RECORD IDs
// ============================================
// Fixed UUIDs ensure idempotency across parallel workers

export const TEST_SELLER_ID = 'e2e00000-0000-0000-0000-000000000001';
export const TEST_BUYER_ID = 'e2e00000-0000-0000-0000-000000000002';
export const TEST_MANDATE_ID = 'e2e00000-0000-0000-0000-000000000003';
export const TEST_FINANCE_PROFILE_ID = 'e2e00000-0000-0000-0000-000000000004';

export const TEST_SELLER_NAME = 'VERIFIED TEST SELLER';
export const TEST_BUYER_NAME = 'VERIFIED TEST BUYER';
export const TEST_MANDATE_TITLE = 'VERIFIED TEST MANDATE';

// ============================================
// SELLER / LEAD HELPERS
// ============================================

export async function ensureTestSellerExists(): Promise<Lead | null> {
  const supabase = getSupabaseClient();
  
  // Upsert with deterministic ID - naturally idempotent
  const { data: seller, error } = await supabase
    .from('leads')
    .upsert({
      id: TEST_SELLER_ID,
      owner_name: TEST_SELLER_NAME,
      email: 'verified-test-seller@dealock.test',
      phone: '+1234567890',
      whatsapp_status: 'not_sent',
      source: 'e2e-test',
      property_type: 'apartment',
      neighborhood: 'Test District',
      city: 'Lisbon',
      price: 500000,
      area_m2: 100,
      bedrooms: 2,
      seller_type: 'owner',
      language_preference: 'en',
      status: 'qualified',
      notes: 'Auto-created by E2E test suite',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) {
    // If upsert failed due to concurrent write, try to fetch existing
    const { data: existing } = await supabase
      .from('leads')
      .select('*')
      .eq('id', TEST_SELLER_ID)
      .single();
    
    if (existing) {
      console.log('[E2E] Using existing test seller:', existing.id);
      return existing as Lead;
    }
    
    console.error('[E2E] Failed to create test seller:', error);
    return null;
  }
  
  console.log('[E2E] Test seller ready:', seller.id);
  return seller as Lead;
}

// ============================================
// BUYER HELPERS
// ============================================

export async function ensureTestBuyerExists(): Promise<Buyer | null> {
  const supabase = getSupabaseClient();
  
  // Upsert with deterministic ID
  const { data: buyer, error } = await supabase
    .from('buyers')
    .upsert({
      id: TEST_BUYER_ID,
      name: TEST_BUYER_NAME,
      email: 'verified-test-buyer@dealock.test',
      phone: '+9876543210',
      status: 'qualified',
      buyer_type: 'investor',
      target_areas: ['Lisbon', 'Porto'],
      property_types: ['apartment', 'house'],
      budget_min: 400000,
      budget_max: 600000,
      min_bedrooms: 1,
      min_area_m2: 50,
      timeline: 'immediate',
      seriousness: 'high',
      pre_approved: true,
      cash_buyer: false,
      next_action: 'Schedule viewing',
      next_action_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Auto-created by E2E test suite',
      language_preference: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) {
    const { data: existing } = await supabase
      .from('buyers')
      .select('*')
      .eq('id', TEST_BUYER_ID)
      .single();
    
    if (existing) {
      console.log('[E2E] Using existing test buyer:', existing.id);
      return existing as Buyer;
    }
    
    console.error('[E2E] Failed to create test buyer:', error);
    return null;
  }
  
  console.log('[E2E] Test buyer ready:', buyer.id);
  
  // Also ensure finance profile exists
  await ensureTestFinanceProfileExists();
  
  return buyer as Buyer;
}

// ============================================
// FINANCE PROFILE HELPERS
// ============================================

export async function ensureTestFinanceProfileExists(): Promise<FinanceProfile | null> {
  const supabase = getSupabaseClient();
  
  const { data: profile, error } = await supabase
    .from('finance_profiles')
    .upsert({
      id: TEST_FINANCE_PROFILE_ID,
      buyer_id: TEST_BUYER_ID,
      status: 'ready_to_progress',
      documents: [
        { type: 'id_document', present: true, verified: true, uploaded_at: new Date().toISOString() },
        { type: 'proof_income', present: true, verified: true, uploaded_at: new Date().toISOString() },
        { type: 'bank_statements', present: true, verified: false, uploaded_at: null },
      ],
      documents_complete: false,
      completion_percentage: 75,
      annual_income: 150000,
      available_down_payment: 100000,
      existing_debt_monthly: 0,
      estimated_max_budget: 600000,
      estimated_monthly_payment: 2500,
      affordability_status: 'comfortable',
      missing_documents: ['tax_returns', 'employment_contract'],
      recommended_actions: ['Complete tax returns'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) {
    const { data: existing } = await supabase
      .from('finance_profiles')
      .select('*')
      .eq('id', TEST_FINANCE_PROFILE_ID)
      .single();
    
    if (existing) {
      console.log('[E2E] Using existing finance profile:', existing.id);
      return existing as FinanceProfile;
    }
    
    console.error('[E2E] Failed to create finance profile:', error);
    return null;
  }
  
  console.log('[E2E] Test finance profile ready:', profile.id);
  return profile as FinanceProfile;
}

// ============================================
// MANDATE HELPERS
// ============================================

export async function ensureTestMandateExists(): Promise<Mandate | null> {
  const supabase = getSupabaseClient();
  
  const { data: mandate, error } = await supabase
    .from('mandates')
    .upsert({
      id: TEST_MANDATE_ID,
      lead_id: TEST_SELLER_ID,
      agency_name: 'Dealock Test Agency',
      exclusive: true,
      signing_mode: 'electronic',
      status: 'signed',
      signed_at: new Date().toISOString(),
      title: TEST_MANDATE_TITLE,
      asking_price: 500000,
      city: 'Lisbon',
      neighborhood: 'Test District',
      property_type: 'apartment',
      area_m2: 100,
      bedrooms: 2,
      notes: 'Auto-created by E2E test suite',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) {
    const { data: existing } = await supabase
      .from('mandates')
      .select('*')
      .eq('id', TEST_MANDATE_ID)
      .single();
    
    if (existing) {
      console.log('[E2E] Using existing test mandate:', existing.id);
      return existing as Mandate;
    }
    
    console.error('[E2E] Failed to create test mandate:', error);
    return null;
  }
  
  console.log('[E2E] Test mandate ready:', mandate.id);
  return mandate as Mandate;
}

// ============================================
// COMPLETE SETUP HELPER
// ============================================

export interface TestDataSet {
  seller: Lead | null;
  buyer: Buyer | null;
  mandate: Mandate | null;
}

export async function ensureTestDataExists(): Promise<TestDataSet> {
  console.log('[E2E] Ensuring test data exists...');
  
  // Run all upserts in parallel - they're idempotent with fixed IDs
  const [seller, buyer, mandate] = await Promise.all([
    ensureTestSellerExists(),
    ensureTestBuyerExists(),
    ensureTestMandateExists(),
  ]);
  
  console.log('[E2E] Test data ready');
  
  return { seller, buyer, mandate };
}

// ============================================
// CHECK HELPERS
// ============================================

export async function hasTestSeller(): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('leads')
    .select('id')
    .eq('id', TEST_SELLER_ID)
    .single();
  return !!data;
}

export async function hasTestBuyer(): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('buyers')
    .select('id')
    .eq('id', TEST_BUYER_ID)
    .single();
  return !!data;
}
