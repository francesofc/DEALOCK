// ============================================
// DEALOCK TYPE SYSTEM
// Five core layers: Sellers, Buyers, Match, Mandates, Finance
// ============================================

// ----------------------------------------
// SELLER LAYER (formerly Leads)
// ----------------------------------------

export type LeadStatus = 
  | 'new' 
  | 'qualified' 
  | 'contacted' 
  | 'replied' 
  | 'call_scheduled' 
  | 'mandate_proposed' 
  | 'mandate_sent' 
  | 'mandate_signed' 
  | 'lost'

export type WhatsappStatus = 'not_sent' | 'sent' | 'delivered' | 'read' | 'replied'

export type SellerType = 'owner' | 'investor' | 'developer' | 'unknown'

export type LanguagePreference = 'fr' | 'pt' | 'en' | 'es'

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  owner_name: string
  email: string
  phone: string
  whatsapp_status: WhatsappStatus
  source: string
  listing_url: string | null
  property_type: string
  neighborhood: string
  city: string
  price: number
  area_m2: number | null
  bedrooms: number | null
  seller_type: SellerType
  language_preference: LanguagePreference
  days_on_market_estimate: number | null
  asking_vs_market_delta: number | null
  photos_quality_score: number | null
  description_quality_score: number | null
  priority_score: number | null
  seller_profile: string | null
  status: LeadStatus
  notes: string | null
}

// Alias for semantic clarity
export type Seller = Lead

// ----------------------------------------
// BUYER LAYER
// ----------------------------------------

export type BuyerStatus = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'viewing_scheduled'
  | 'offer_pending'
  | 'closed'
  | 'inactive'

export type BuyerType = 'first_time' | 'investor' | 'relocating' | 'upgrading' | 'downsizing'

export type ReadinessLevel = 'browsing' | '3_months' | '1_month' | 'immediate'

export type SeriousnessLevel = 'low' | 'medium' | 'high' | 'very_high'

export interface Buyer {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string
  phone: string
  status: BuyerStatus
  buyer_type: BuyerType
  
  // Search Criteria
  target_areas: string[]
  property_types: string[]
  budget_min: number
  budget_max: number
  min_bedrooms: number | null
  min_area_m2: number | null
  
  // Qualification
  timeline: ReadinessLevel
  seriousness: SeriousnessLevel
  pre_approved: boolean
  cash_buyer: boolean
  
  // Next Actions
  next_action: string
  next_action_date: string | null
  
  // Notes
  notes: string | null
  language_preference: LanguagePreference
}

// ----------------------------------------
// MATCH LAYER
// ----------------------------------------

export type MatchStatus = 
  | 'identified'
  | 'contacted_buyer'
  | 'viewing_scheduled'
  | 'offer_received'
  | 'negotiating'
  | 'closed'
  | 'archived'

export type MatchScore = 'weak' | 'fair' | 'good' | 'excellent'

export interface MatchOpportunity {
  id: string
  created_at: string
  updated_at: string
  
  // Connections
  buyer_id: string
  seller_id: string
  mandate_id: string | null
  
  // Match Details
  match_score: MatchScore
  match_score_value: number // 0-100
  match_reasons: string[]
  
  // Status
  status: MatchStatus
  
  // Recommended Action
  recommended_action: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Notes
  notes: string | null
}

// ----------------------------------------
// FINANCE LAYER
// ----------------------------------------

export type FinanceStatus = 
  | 'incomplete'
  | 'under_review'
  | 'needs_clarification'
  | 'ready_to_progress'
  | 'strong_buyer'

export type DocumentType = 
  | 'id_document'
  | 'proof_income'
  | 'bank_statements'
  | 'tax_returns'
  | 'employment_contract'
  | 'existing_property_docs'
  | 'loan_pre_approval'

export interface DocumentCheck {
  type: DocumentType
  present: boolean
  verified: boolean
  uploaded_at: string | null
}

export interface FinanceProfile {
  id: string
  created_at: string
  updated_at: string
  buyer_id: string
  
  // Status
  status: FinanceStatus
  
  // Documents
  documents: DocumentCheck[]
  documents_complete: boolean
  completion_percentage: number // 0-100
  
  // Financials (indicative)
  annual_income: number | null
  available_down_payment: number | null
  existing_debt_monthly: number | null
  
  // Calculated
  estimated_max_budget: number | null
  estimated_monthly_payment: number | null
  affordability_status: 'insufficient' | 'tight' | 'comfortable' | 'strong' | null
  
  // Review
  under_review_since: string | null
  reviewed_by: string | null
  review_notes: string | null
  
  // Next Steps
  missing_documents: DocumentType[]
  recommended_actions: string[]
}

// ----------------------------------------
// ACTIVITY LAYER
// ----------------------------------------

export type ActivityType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'note' | 'mandate' | 'lead' | 'buyer' | 'match' | 'finance'

export interface Activity {
  id: string
  created_at: string
  type: ActivityType
  content: string
  operator_name: string
  
  // Can relate to any entity
  lead_id: string | null
  buyer_id: string | null
  match_id: string | null
  mandate_id: string | null
}

// ----------------------------------------
// MANDATE LAYER
// ----------------------------------------

export type MandateStatus = 'draft' | 'sent' | 'signed' | 'expired' | 'terminated'

export type SigningMode = 'physical' | 'electronic' | 'remote'

export interface Mandate {
  id: string
  lead_id: string
  created_at: string
  agency_name: string
  exclusive: boolean
  signing_mode: SigningMode
  status: MandateStatus
  signed_at: string | null
  notes: string | null
}

// ----------------------------------------
// LEGACY AI OUTPUTS (kept for compatibility)
// ----------------------------------------

export interface AIOutput {
  id: string
  lead_id: string
  created_at: string
  recommended_language: LanguagePreference
  angle: string
  message_initial_fr: string
  message_initial_pt: string
  message_initial_en: string
  voice_script_fr: string
  voice_script_pt: string
  voice_script_en: string
  followup_d2_fr: string
  followup_d2_pt: string
  followup_d2_en: string
  followup_d5_fr: string
  followup_d5_pt: string
  followup_d5_en: string
  exclusivity_push_fr: string
  exclusivity_push_pt: string
  exclusivity_push_en: string
  qualification_questions_fr: string[]
  qualification_questions_pt: string[]
  qualification_questions_en: string[]
  objections_json: Record<string, string> | null
  next_best_action: string
}

// ----------------------------------------
// DATABASE TYPE FOR SUPABASE
// ----------------------------------------

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>
      }
      buyers: {
        Row: Buyer
        Insert: Omit<Buyer, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Buyer, 'id' | 'created_at'>>
      }
      match_opportunities: {
        Row: MatchOpportunity
        Insert: Omit<MatchOpportunity, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<MatchOpportunity, 'id' | 'created_at'>>
      }
      finance_profiles: {
        Row: FinanceProfile
        Insert: Omit<FinanceProfile, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<FinanceProfile, 'id' | 'created_at'>>
      }
      activities: {
        Row: Activity
        Insert: Omit<Activity, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Activity, 'id' | 'created_at'>>
      }
      ai_outputs: {
        Row: AIOutput
        Insert: Omit<AIOutput, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<AIOutput, 'id' | 'created_at'>>
      }
      mandates: {
        Row: Mandate
        Insert: Omit<Mandate, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Mandate, 'id' | 'created_at'>>
      }
    }
  }
}
