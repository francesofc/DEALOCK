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

export type LanguagePreference = 'fr' | 'pt' | 'en'

export type ActivityType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'note' | 'mandate' | 'lead'

export type MandateStatus = 'draft' | 'sent' | 'signed' | 'expired' | 'terminated'

export type SigningMode = 'physical' | 'electronic' | 'remote'

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  owner_name: string
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

export interface Activity {
  id: string
  lead_id: string
  created_at: string
  type: ActivityType
  content: string
  operator_name: string
}

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

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>
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
