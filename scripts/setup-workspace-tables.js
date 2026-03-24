#!/usr/bin/env node
/**
 * ============================================
 * DEALOCK WORKSPACE TABLES SETUP
 * ============================================
 * 
 * Run this script to create the workspace and onboarding tables in Supabase.
 * 
 * Usage: node scripts/setup-workspace-tables.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
-- ============================================
-- WORKSPACE & ONBOARDING TABLES (Phase 2)
-- ============================================

-- Team size enum
CREATE TYPE IF NOT EXISTS team_size AS ENUM ('solo', 'small', 'medium', 'large');

-- Onboarding status enum
CREATE TYPE IF NOT EXISTS onboarding_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- Workspace configuration table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Agency identity (required)
  agency_name TEXT NOT NULL,
  agency_description TEXT,
  agency_website TEXT,
  agency_email TEXT,
  agency_phone TEXT,
  primary_market TEXT NOT NULL,
  
  -- Team & operation
  team_size team_size DEFAULT 'solo',
  property_types TEXT[] DEFAULT '{}',
  
  -- Brand assets
  logo_url TEXT,
  primary_color TEXT DEFAULT '#10b981',
  
  -- Onboarding state
  onboarding_status onboarding_status DEFAULT 'not_started',
  onboarding_step TEXT DEFAULT 'welcome',
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_checklist JSONB DEFAULT '[]'::jsonb,
  
  -- Workspace settings
  settings JSONB DEFAULT '{
    "currency": "EUR",
    "areaUnit": "m2",
    "dateFormat": "DD/MM/YYYY",
    "language": "en",
    "notifications": {
      "email": true,
      "browser": true
    }
  }'::jsonb,
  
  -- Enrichment state (future AI)
  enrichment_status TEXT DEFAULT 'pending',
  enrichment_data JSONB DEFAULT '{}'::jsonb,
  enrichment_completed_at TIMESTAMPTZ,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true
);

-- Workspace activity log
CREATE TABLE IF NOT EXISTS workspace_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}'::jsonb,
  performed_by TEXT
);

-- Indexes for workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_onboarding_status ON workspaces(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_workspaces_is_active ON workspaces(is_active);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_workspace_id ON workspace_activities(workspace_id);

-- Enable realtime for workspaces
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
`;

async function setup() {
  console.log('🔧 Setting up Dealock workspace tables...\n');
  
  try {
    // Check if workspaces table exists
    const { error: checkError } = await supabase
      .from('workspaces')
      .select('id')
      .limit(1);
    
    if (!checkError) {
      console.log('✓ workspaces table already exists');
      return;
    }
    
    if (checkError.message.includes('does not exist')) {
      console.log('⚠ workspaces table does not exist');
      console.log('\n📋 Please run the following SQL in your Supabase SQL Editor:');
      console.log('\n--- COPY FROM HERE ---');
      console.log(sql);
      console.log('--- END ---\n');
      console.log('🔗 Open: https://supabase.com/dashboard/project/_/sql/new');
      console.log('   (Replace _ with your project ID)\n');
    } else {
      console.error('❌ Error checking workspaces table:', checkError.message);
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setup();
