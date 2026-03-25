-- ============================================
-- DEALOCK FINAL PILOT MIGRATION
-- MUST BE APPLIED BEFORE PILOT LAUNCH
-- Execute in Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- PART A: STRUCTURAL (REQUIRED FOR ISOLATION)
-- ============================================

-- 1. PROFILES TABLE (Links auth.users to workspaces)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'agent', 'viewer')),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  language_preference TEXT DEFAULT 'en'
);

CREATE INDEX IF NOT EXISTS idx_profiles_workspace_id ON profiles(workspace_id);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. IMPORT_SESSIONS TABLE
DO $$ BEGIN
  CREATE TYPE import_status AS ENUM ('completed', 'partial', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS import_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('seller', 'buyer')),
  file_name TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_count INTEGER NOT NULL DEFAULT 0,
  invalid_count INTEGER NOT NULL DEFAULT 0,
  file_duplicate_count INTEGER NOT NULL DEFAULT 0,
  db_duplicate_count INTEGER NOT NULL DEFAULT 0,
  ignored_count INTEGER NOT NULL DEFAULT 0,
  status import_status NOT NULL DEFAULT 'completed',
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_import_sessions_workspace_id ON import_sessions(workspace_id);
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;

-- 3. ADD WORKSPACE_ID TO ALL ENTITY TABLES
ALTER TABLE leads ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE buyers ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE finance_profiles ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE mandates ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE match_opportunities ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE ai_outputs ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_buyers_workspace_id ON buyers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_finance_profiles_workspace_id ON finance_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activities_workspace_id ON activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mandates_workspace_id ON mandates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_match_opportunities_workspace_id ON match_opportunities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_workspace_id ON ai_outputs(workspace_id);

-- 5. HELPER FUNCTION FOR RLS
CREATE OR REPLACE FUNCTION get_current_user_workspace()
RETURNS UUID AS $$
DECLARE
  ws_id UUID;
BEGIN
  SELECT workspace_id INTO ws_id FROM profiles WHERE id = auth.uid();
  RETURN ws_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART B: REAL RLS POLICIES (CRITICAL SECURITY)
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
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- REMOVE OLD PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Allow all" ON leads;
DROP POLICY IF EXISTS "Allow all" ON buyers;
DROP POLICY IF EXISTS "Allow all" ON finance_profiles;
DROP POLICY IF EXISTS "Allow all" ON activities;
DROP POLICY IF EXISTS "Allow all" ON ai_outputs;
DROP POLICY IF EXISTS "Allow all" ON mandates;
DROP POLICY IF EXISTS "Allow all" ON match_opportunities;
DROP POLICY IF EXISTS "Allow all import_sessions" ON import_sessions;
DROP POLICY IF EXISTS "Allow all workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow all workspace_activities" ON workspace_activities;

-- WORKSPACE ISOLATION POLICIES (THESE ENFORCE REAL SECURITY)
CREATE POLICY "Workspace isolation for leads" ON leads
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

CREATE POLICY "Workspace isolation for buyers" ON buyers
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

CREATE POLICY "Workspace isolation for finance_profiles" ON finance_profiles
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

CREATE POLICY "Workspace isolation for activities" ON activities
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

CREATE POLICY "Workspace isolation for ai_outputs" ON ai_outputs
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

CREATE POLICY "Workspace isolation for mandates" ON mandates
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

CREATE POLICY "Workspace isolation for match_opportunities" ON match_opportunities
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

CREATE POLICY "Workspace isolation for import_sessions" ON import_sessions
  FOR ALL USING (workspace_id = get_current_user_workspace()) WITH CHECK (workspace_id = get_current_user_workspace());

CREATE POLICY "Users can view own workspace" ON workspaces
  FOR SELECT USING (id = get_current_user_workspace());

CREATE POLICY "Users can update own workspace" ON workspaces
  FOR UPDATE USING (id = get_current_user_workspace());

-- ============================================
-- PART C: REALTIME ENABLEMENT
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE import_sessions;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
