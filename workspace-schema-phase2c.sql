-- ============================================
-- DEALOCK WORKSPACE TABLES — PHASE 2C
-- Safe incremental schema for existing databases
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Enums (safe with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_size') THEN
    CREATE TYPE team_size AS ENUM ('solo', 'small', 'medium', 'large');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_status') THEN
    CREATE TYPE onboarding_status AS ENUM ('not_started', 'in_progress', 'completed');
  END IF;
END $$;

-- Step 2: Workspaces table (safe with IF NOT EXISTS)
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

-- Step 3: Workspace activities table (safe with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS workspace_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}'::jsonb,
  performed_by TEXT
);

-- Step 4: Indexes (safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_workspaces_onboarding_status ON workspaces(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_workspaces_is_active ON workspaces(is_active);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_workspace_id ON workspace_activities(workspace_id);

-- Step 5: Row Level Security (safe — idempotent)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow all workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow all workspace_activities" ON workspace_activities;

-- Create policies
CREATE POLICY "Allow all workspaces" ON workspaces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all workspace_activities" ON workspace_activities FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Auto-update trigger for workspaces
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at 
  BEFORE UPDATE ON workspaces 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Enable realtime (safe — check first)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Check if table is already in publication
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'workspaces'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
    END IF;
  END IF;
END $$;
