-- Dealock Database Schema
-- Run this in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Lead status enum
CREATE TYPE lead_status AS ENUM (
  'new', 
  'qualified', 
  'contacted', 
  'replied', 
  'call_scheduled', 
  'mandate_proposed', 
  'mandate_sent', 
  'mandate_signed', 
  'lost'
);

-- WhatsApp status enum
CREATE TYPE whatsapp_status AS ENUM (
  'not_sent', 
  'sent', 
  'delivered', 
  'read', 
  'replied'
);

-- Seller type enum
CREATE TYPE seller_type AS ENUM (
  'owner', 
  'investor', 
  'developer', 
  'unknown'
);

-- Language preference enum
CREATE TYPE language_preference AS ENUM (
  'fr', 
  'pt', 
  'en',
  'es'
);

-- Activity type enum
CREATE TYPE activity_type AS ENUM (
  'call', 
  'email', 
  'whatsapp', 
  'meeting', 
  'note', 
  'mandate', 
  'lead',
  'buyer',
  'match',
  'finance'
);

-- Mandate status enum
CREATE TYPE mandate_status AS ENUM (
  'draft', 
  'sent', 
  'signed', 
  'expired', 
  'terminated'
);

-- Signing mode enum
CREATE TYPE signing_mode AS ENUM (
  'physical', 
  'electronic', 
  'remote'
);

-- Buyer status enum
CREATE TYPE buyer_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'viewing_scheduled',
  'offer_pending',
  'closed',
  'inactive'
);

-- Buyer type enum
CREATE TYPE buyer_type AS ENUM (
  'first_time',
  'investor',
  'relocating',
  'upgrading',
  'downsizing'
);

-- Readiness level enum
CREATE TYPE readiness_level AS ENUM (
  'browsing',
  '3_months',
  '1_month',
  'immediate'
);

-- Seriousness level enum
CREATE TYPE seriousness_level AS ENUM (
  'low',
  'medium',
  'high',
  'very_high'
);

-- Finance status enum
CREATE TYPE finance_status AS ENUM (
  'incomplete',
  'under_review',
  'needs_clarification',
  'ready_to_progress',
  'strong_buyer'
);

-- Match status enum
CREATE TYPE match_status AS ENUM (
  'identified',
  'contacted_buyer',
  'viewing_scheduled',
  'offer_received',
  'negotiating',
  'closed',
  'archived'
);

-- Match score band enum
CREATE TYPE match_score_band AS ENUM (
  'excellent',
  'good',
  'fair',
  'weak'
);

-- Target type enum (for match opportunities)
CREATE TYPE target_type AS ENUM (
  'mandate',
  'seller'
);

-- ============================================
-- TABLES
-- ============================================

-- Leads table (Sellers)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  whatsapp_status whatsapp_status DEFAULT 'not_sent',
  source TEXT DEFAULT '',
  listing_url TEXT,
  property_type TEXT DEFAULT 'apartment',
  neighborhood TEXT DEFAULT '',
  city TEXT NOT NULL,
  price DECIMAL(12, 2) DEFAULT 0,
  area_m2 DECIMAL(8, 2),
  bedrooms INTEGER,
  seller_type seller_type DEFAULT 'unknown',
  language_preference language_preference DEFAULT 'en',
  days_on_market_estimate INTEGER,
  asking_vs_market_delta DECIMAL(5, 2),
  photos_quality_score DECIMAL(3, 2),
  description_quality_score DECIMAL(3, 2),
  priority_score DECIMAL(3, 2),
  seller_profile TEXT,
  status lead_status DEFAULT 'new',
  notes TEXT
);

-- Buyers table
CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  status buyer_status DEFAULT 'new',
  buyer_type buyer_type DEFAULT 'first_time',
  target_areas TEXT[] DEFAULT '{}',
  property_types TEXT[] DEFAULT '{}',
  budget_min DECIMAL(12, 2) DEFAULT 0,
  budget_max DECIMAL(12, 2) DEFAULT 0,
  min_bedrooms INTEGER,
  min_area_m2 DECIMAL(8, 2),
  timeline readiness_level DEFAULT 'browsing',
  seriousness seriousness_level DEFAULT 'medium',
  pre_approved BOOLEAN DEFAULT false,
  cash_buyer BOOLEAN DEFAULT false,
  next_action TEXT DEFAULT '',
  next_action_date TIMESTAMPTZ,
  notes TEXT,
  language_preference language_preference DEFAULT 'en'
);

-- Finance Profiles table
CREATE TABLE finance_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE NOT NULL,
  status finance_status DEFAULT 'incomplete',
  documents JSONB DEFAULT '[]',
  documents_complete BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  annual_income DECIMAL(12, 2),
  available_down_payment DECIMAL(12, 2),
  existing_debt_monthly DECIMAL(10, 2),
  estimated_max_budget DECIMAL(12, 2),
  estimated_monthly_payment DECIMAL(10, 2),
  affordability_status TEXT,
  under_review_since TIMESTAMPTZ,
  reviewed_by TEXT,
  review_notes TEXT,
  missing_documents TEXT[] DEFAULT '{}',
  recommended_actions TEXT[] DEFAULT '{}'
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  content TEXT NOT NULL,
  operator_name TEXT NOT NULL DEFAULT 'System',
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
  match_id UUID,
  mandate_id UUID
);

-- AI Outputs table
CREATE TABLE ai_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  recommended_language language_preference NOT NULL,
  angle TEXT NOT NULL,
  message_initial_fr TEXT NOT NULL,
  message_initial_pt TEXT NOT NULL,
  message_initial_en TEXT NOT NULL,
  voice_script_fr TEXT NOT NULL,
  voice_script_pt TEXT NOT NULL,
  voice_script_en TEXT NOT NULL,
  followup_d2_fr TEXT NOT NULL,
  followup_d2_pt TEXT NOT NULL,
  followup_d2_en TEXT NOT NULL,
  followup_d5_fr TEXT NOT NULL,
  followup_d5_pt TEXT NOT NULL,
  followup_d5_en TEXT NOT NULL,
  exclusivity_push_fr TEXT NOT NULL,
  exclusivity_push_pt TEXT NOT NULL,
  exclusivity_push_en TEXT NOT NULL,
  qualification_questions_fr TEXT[] DEFAULT '{}',
  qualification_questions_pt TEXT[] DEFAULT '{}',
  qualification_questions_en TEXT[] DEFAULT '{}',
  objections_json JSONB,
  next_best_action TEXT NOT NULL
);

-- Mandates table
CREATE TABLE mandates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  agency_name TEXT NOT NULL DEFAULT 'Dealock Agency',
  exclusive BOOLEAN DEFAULT true,
  signing_mode signing_mode DEFAULT 'electronic',
  status mandate_status DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  notes TEXT,
  -- Property details for continuity
  title TEXT,
  asking_price DECIMAL(12, 2),
  city TEXT,
  neighborhood TEXT,
  property_type TEXT,
  area_m2 DECIMAL(8, 2),
  bedrooms INTEGER
);

-- Match Opportunities table
CREATE TABLE match_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  -- Core relationships
  buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE NOT NULL,
  target_type target_type NOT NULL,
  target_id UUID NOT NULL, -- Can reference mandates.id or leads.id
  -- Match scoring
  match_score match_score_band DEFAULT 'fair',
  score_value INTEGER CHECK (score_value >= 0 AND score_value <= 100),
  -- Analysis
  match_reasons TEXT[] DEFAULT '{}',
  blockers TEXT[] DEFAULT '{}',
  recommended_action TEXT,
  -- Status and priority
  status match_status DEFAULT 'identified',
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  -- Notes
  notes TEXT
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_priority_score ON leads(priority_score DESC);

CREATE INDEX idx_buyers_status ON buyers(status);
CREATE INDEX idx_buyers_created_at ON buyers(created_at DESC);
CREATE INDEX idx_buyers_buyer_type ON buyers(buyer_type);

CREATE INDEX idx_finance_profiles_buyer_id ON finance_profiles(buyer_id);
CREATE INDEX idx_finance_profiles_status ON finance_profiles(status);

CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_buyer_id ON activities(buyer_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

CREATE INDEX idx_ai_outputs_lead_id ON ai_outputs(lead_id);

CREATE INDEX idx_mandates_lead_id ON mandates(lead_id);
CREATE INDEX idx_mandates_status ON mandates(status);
CREATE INDEX idx_mandates_city ON mandates(city);

CREATE INDEX idx_match_opportunities_buyer_id ON match_opportunities(buyer_id);
CREATE INDEX idx_match_opportunities_target ON match_opportunities(target_type, target_id);
CREATE INDEX idx_match_opportunities_status ON match_opportunities(status);
CREATE INDEX idx_match_opportunities_score ON match_opportunities(score_value DESC);

-- ============================================
-- ROW LEVEL SECURITY (Phase 7B: Real workspace isolation)
-- ============================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;

-- Helper function: Get current user's workspace_id
CREATE OR REPLACE FUNCTION get_current_user_workspace()
RETURNS UUID AS $$
DECLARE
  ws_id UUID;
BEGIN
  SELECT workspace_id INTO ws_id
  FROM profiles
  WHERE id = auth.uid();
  RETURN ws_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leads: Users can only access leads in their workspace
CREATE POLICY "Workspace isolation for leads" ON leads
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Buyers: Users can only access buyers in their workspace
CREATE POLICY "Workspace isolation for buyers" ON buyers
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Finance Profiles: Users can only access profiles in their workspace
CREATE POLICY "Workspace isolation for finance_profiles" ON finance_profiles
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Activities: Users can only access activities in their workspace
CREATE POLICY "Workspace isolation for activities" ON activities
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- AI Outputs: Users can only access outputs in their workspace
CREATE POLICY "Workspace isolation for ai_outputs" ON ai_outputs
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Mandates: Users can only access mandates in their workspace
CREATE POLICY "Workspace isolation for mandates" ON mandates
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Match Opportunities: Users can only access matches in their workspace
CREATE POLICY "Workspace isolation for match_opportunities" ON match_opportunities
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Import Sessions: Users can only access imports in their workspace
CREATE POLICY "Workspace isolation for import_sessions" ON import_sessions
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- ============================================
-- AUTO-UPDATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyers_updated_at 
  BEFORE UPDATE ON buyers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_profiles_updated_at 
  BEFORE UPDATE ON finance_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mandates_updated_at 
  BEFORE UPDATE ON mandates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_opportunities_updated_at 
  BEFORE UPDATE ON match_opportunities 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- WORKSPACE & ONBOARDING TABLES (Phase 2)
-- ============================================

-- Team size enum
CREATE TYPE team_size AS ENUM ('solo', 'small', 'medium', 'large');

-- Onboarding status enum
CREATE TYPE onboarding_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- Workspace configuration table
CREATE TABLE workspaces (
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

-- Workspace activity log (for tracking onboarding actions)
CREATE TABLE workspace_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'onboarding_step', 'enrichment', 'settings_change', etc.
  activity_data JSONB DEFAULT '{}'::jsonb,
  performed_by TEXT -- user identifier
);

-- Indexes for workspaces
CREATE INDEX idx_workspaces_onboarding_status ON workspaces(onboarding_status);
CREATE INDEX idx_workspaces_is_active ON workspaces(is_active);
CREATE INDEX idx_workspace_activities_workspace_id ON workspace_activities(workspace_id);

-- ============================================
-- PROFILES TABLE (Phase 7B: User-Workspace linkage)
-- ============================================

-- Profiles table links auth.users to workspaces
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User info
  full_name TEXT,
  avatar_url TEXT,
  
  -- Role (simple for pilot: admin/agent/viewer)
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'agent', 'viewer')),
  
  -- Workspace linkage (critical for isolation)
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  
  -- Preferences
  language_preference TEXT DEFAULT 'en'
);

-- Index for workspace lookups
CREATE INDEX idx_profiles_workspace_id ON profiles(workspace_id);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to update profiles updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- WORKSPACE_ID INDEXES (Phase 7B: Query performance)
-- ============================================

CREATE INDEX idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX idx_buyers_workspace_id ON buyers(workspace_id);
CREATE INDEX idx_finance_profiles_workspace_id ON finance_profiles(workspace_id);
CREATE INDEX idx_activities_workspace_id ON activities(workspace_id);
CREATE INDEX idx_ai_outputs_workspace_id ON ai_outputs(workspace_id);
CREATE INDEX idx_mandates_workspace_id ON mandates(workspace_id);
CREATE INDEX idx_match_opportunities_workspace_id ON match_opportunities(workspace_id);
CREATE INDEX idx_import_sessions_workspace_id ON import_sessions(workspace_id);

-- Enable realtime for workspaces
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;

-- ============================================
-- RLS FIX FOR WORKSPACES TABLE
-- Run this if workspaces aren't visible in browser
-- ============================================

-- Enable RLS on workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow all workspace_activities" ON workspace_activities;

-- Phase 7B: Workspaces - Users can only see their linked workspace
CREATE POLICY "Users can view own workspace" ON workspaces
  FOR SELECT USING (id = get_current_user_workspace());

CREATE POLICY "Users can update own workspace" ON workspaces
  FOR UPDATE USING (id = get_current_user_workspace());

-- Phase 7B: Workspace activities - Users can only see activities in their workspace
CREATE POLICY "Workspace isolation for workspace_activities" ON workspace_activities
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());


-- ============================================
-- IMPORT SESSIONS (Phase 5)
-- ============================================

-- Import status enum
CREATE TYPE import_status AS ENUM (
  'completed',
  'partial',
  'failed'
);

-- Import sessions table for tracking import history
CREATE TABLE import_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Import metadata
  entity_type TEXT NOT NULL CHECK (entity_type IN ('seller', 'buyer')),
  file_name TEXT NOT NULL,
  
  -- Row counts
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_count INTEGER NOT NULL DEFAULT 0,
  invalid_count INTEGER NOT NULL DEFAULT 0,
  file_duplicate_count INTEGER NOT NULL DEFAULT 0,
  db_duplicate_count INTEGER NOT NULL DEFAULT 0,
  ignored_count INTEGER NOT NULL DEFAULT 0,
  
  -- Session status
  status import_status NOT NULL DEFAULT 'completed',
  
  -- Optional error message for failed imports
  error_message TEXT
);

-- Index for querying recent imports
CREATE INDEX idx_import_sessions_created_at ON import_sessions(created_at DESC);
CREATE INDEX idx_import_sessions_entity_type ON import_sessions(entity_type);

-- Enable RLS
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all access for Phase 5 (will be restricted with auth later)
CREATE POLICY "Allow all import_sessions" ON import_sessions FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for import_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE import_sessions;
