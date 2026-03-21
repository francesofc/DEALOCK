-- MandateOS Database Schema
-- Run this in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  'en'
);

-- Activity type enum
CREATE TYPE activity_type AS ENUM (
  'call', 
  'email', 
  'whatsapp', 
  'meeting', 
  'note', 
  'mandate', 
  'lead'
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

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_status whatsapp_status DEFAULT 'not_sent',
  source TEXT,
  listing_url TEXT,
  property_type TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  price DECIMAL(12, 2),
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

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type activity_type NOT NULL,
  content TEXT NOT NULL,
  operator_name TEXT NOT NULL
);

-- AI Outputs table
CREATE TABLE ai_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
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
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  agency_name TEXT NOT NULL,
  exclusive BOOLEAN DEFAULT true,
  signing_mode signing_mode DEFAULT 'electronic',
  status mandate_status DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_priority_score ON leads(priority_score DESC);
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_ai_outputs_lead_id ON ai_outputs(lead_id);
CREATE INDEX idx_mandates_lead_id ON mandates(lead_id);
CREATE INDEX idx_mandates_status ON mandates(status);

-- Row Level Security (RLS) policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandates ENABLE ROW LEVEL SECURITY;

-- For Phase 2: Allow all access (will be restricted in Phase 3 with auth)
CREATE POLICY "Allow all" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ai_outputs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON mandates FOR ALL USING (true) WITH CHECK (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for leads updated_at
CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
