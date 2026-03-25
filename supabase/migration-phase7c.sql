-- ============================================
-- DEALOCK Phase 7C Migration
-- Apply this to the REAL Supabase project
-- ============================================

-- This migration adds the missing Phase 7B elements to the real database

-- ============================================
-- 1. PROFILES TABLE (User-Workspace linkage)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
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
CREATE INDEX IF NOT EXISTS idx_profiles_workspace_id ON profiles(workspace_id);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to update profiles updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. IMPORT_SESSIONS TABLE
-- ============================================

-- Import status enum
DO $$ BEGIN
  CREATE TYPE import_status AS ENUM (
    'completed',
    'partial',
    'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Import sessions table
CREATE TABLE IF NOT EXISTS import_sessions (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_import_sessions_created_at ON import_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_sessions_entity_type ON import_sessions(entity_type);
CREATE INDEX IF NOT EXISTS idx_import_sessions_workspace_id ON import_sessions(workspace_id);

-- Enable RLS
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. ADD WORKSPACE_ID TO ALL ENTITY TABLES
-- ============================================

-- Add workspace_id to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to buyers
ALTER TABLE buyers ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to finance_profiles
ALTER TABLE finance_profiles ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to mandates
ALTER TABLE mandates ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to match_opportunities
ALTER TABLE match_opportunities ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to ai_outputs
ALTER TABLE ai_outputs ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- ============================================
-- 4. CREATE INDEXES FOR WORKSPACE QUERIES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_buyers_workspace_id ON buyers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_finance_profiles_workspace_id ON finance_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activities_workspace_id ON activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mandates_workspace_id ON mandates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_match_opportunities_workspace_id ON match_opportunities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_workspace_id ON ai_outputs(workspace_id);

-- ============================================
-- 5. HELPER FUNCTION FOR RLS
-- ============================================

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

-- ============================================
-- 6. REAL RLS POLICIES (Workspace Isolation)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all" ON leads;
DROP POLICY IF EXISTS "Allow all" ON buyers;
DROP POLICY IF EXISTS "Allow all" ON finance_profiles;
DROP POLICY IF EXISTS "Allow all" ON activities;
DROP POLICY IF EXISTS "Allow all" ON ai_outputs;
DROP POLICY IF EXISTS "Allow all" ON mandates;
DROP POLICY IF EXISTS "Allow all" ON match_opportunities;
DROP POLICY IF EXISTS "Allow all import_sessions" ON import_sessions;

-- Drop old workspace policies if they exist
DROP POLICY IF EXISTS "Allow all workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow all workspace_activities" ON workspace_activities;

-- Create workspace-isolated policies for leads
DROP POLICY IF EXISTS "Workspace isolation for leads" ON leads;
CREATE POLICY "Workspace isolation for leads" ON leads
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Create workspace-isolated policies for buyers
DROP POLICY IF EXISTS "Workspace isolation for buyers" ON buyers;
CREATE POLICY "Workspace isolation for buyers" ON buyers
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Create workspace-isolated policies for finance_profiles
DROP POLICY IF EXISTS "Workspace isolation for finance_profiles" ON finance_profiles;
CREATE POLICY "Workspace isolation for finance_profiles" ON finance_profiles
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Create workspace-isolated policies for activities
DROP POLICY IF EXISTS "Workspace isolation for activities" ON activities;
CREATE POLICY "Workspace isolation for activities" ON activities
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Create workspace-isolated policies for ai_outputs
DROP POLICY IF EXISTS "Workspace isolation for ai_outputs" ON ai_outputs;
CREATE POLICY "Workspace isolation for ai_outputs" ON ai_outputs
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Create workspace-isolated policies for mandates
DROP POLICY IF EXISTS "Workspace isolation for mandates" ON mandates;
CREATE POLICY "Workspace isolation for mandates" ON mandates
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Create workspace-isolated policies for match_opportunities
DROP POLICY IF EXISTS "Workspace isolation for match_opportunities" ON match_opportunities;
CREATE POLICY "Workspace isolation for match_opportunities" ON match_opportunities
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- Create workspace-isolated policies for import_sessions
DROP POLICY IF EXISTS "Workspace isolation for import_sessions" ON import_sessions;
CREATE POLICY "Workspace isolation for import_sessions" ON import_sessions
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- ============================================
-- 7. WORKSPACE POLICIES
-- ============================================

-- Users can only see their linked workspace
DROP POLICY IF EXISTS "Users can view own workspace" ON workspaces;
CREATE POLICY "Users can view own workspace" ON workspaces
  FOR SELECT USING (id = get_current_user_workspace());

-- Users can only update their linked workspace
DROP POLICY IF EXISTS "Users can update own workspace" ON workspaces;
CREATE POLICY "Users can update own workspace" ON workspaces
  FOR UPDATE USING (id = get_current_user_workspace());

-- Workspace activities isolation
DROP POLICY IF EXISTS "Workspace isolation for workspace_activities" ON workspace_activities;
CREATE POLICY "Workspace isolation for workspace_activities" ON workspace_activities
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

-- ============================================
-- 8. ENABLE REALTIME FOR IMPORT_SESSIONS
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE import_sessions;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
