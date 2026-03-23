// Seller Intelligence Types for Dealock
// Transitional layer - will integrate with AI backend in future phase

export type SellerMindset = 
  | 'frustrated'           // Tired of process, other agents failed
  | 'rational'             // Data-driven, wants facts
  | 'emotional'            // Attached to property, needs empathy
  | 'exploratory'          // Just testing waters, low urgency
  | 'disappointed'         // Already represented, unhappy
  | 'urgent'               // Needs fast sale, motivated
  | 'suspicious'           // Skeptical, needs trust building
  | 'premium_expectations' // Wants luxury service

export type RelationshipState =
  | 'cold'           // No contact yet
  | 'neutral'        // Initial contact made
  | 'engaged'        // Responsive, showing interest
  | 'hesitant'       // Interested but has concerns
  | 'developing_trust'
  | 'strong_rapport'
  | 'ready_to_commit'

export type DealMomentum =
  | 'weak'          // No activity, stalled
  | 'stable'        // Steady progress
  | 'improving'     // Recent positive signals
  | 'near_mandate'  // Close to signing
  | 'at_risk'       // Signals of pulling away
  | 'accelerating'  // Fast progress recently

export type RecommendedAngle =
  | 'data_driven'      // Use market data, comparables
  | 'emotional'        // Connect with their story
  | 'urgency'          // Timeline pressure
  | 'exclusivity_value'// Focus on what exclusivity gives them
  | 'service_premium'  // High-touch service approach
  | 'problem_solver'   // Fix their selling problems
  | 'market_expert'    // Position as local expert
  | 'reassurance'      // Address fears and concerns

export type ToneGuidance =
  | 'professional_confident'
  | 'warm_personal'
  | 'data_authoritative'
  | 'urgent_but_respectful'
  | 'patient_supportive'
  | 'premium_exclusive'
  | 'direct_no_nonsense'
  | 'consultative'

export type NextBestMove =
  | 'send_market_analysis'
  | 'schedule_call'
  | 'schedule_meeting'
  | 'send_mandate_proposal'
  | 'follow_up_email'
  | 'whatsapp_check_in'
  | 'share_testimonial'
  | 'address_objection'
  | 'exclusivity_pitch'
  | 'wait_and_nurture'
  | 'reactivate'
  | 'close_or_qualify'

export type TimingRecommendation =
  | 'immediate'      // Contact within hours
  | 'today'          // Contact today
  | 'tomorrow'       // Wait until tomorrow
  | 'this_week'      // Sometime this week
  | 'next_week'      // Early next week
  | 'wait_for_signal'// Wait for them to respond

export interface SellerIntelligence {
  lead_id: string
  
  // Core Analysis
  seller_mindset: SellerMindset
  relationship_state: RelationshipState
  deal_momentum: DealMomentum
  
  // Strategic Guidance
  recommended_angle: RecommendedAngle
  tone_to_use: ToneGuidance
  next_best_move: NextBestMove
  suggested_timing: TimingRecommendation
  
  // Content
  suggested_opening: string
  key_talking_points: string[]
  what_to_avoid: string[]
  objection_prep: Record<string, string>
  
  // Mandate Specific
  mandate_readiness_score: number  // 0-100
  exclusivity_potential: 'low' | 'medium' | 'high' | 'very_high'
  estimated_days_to_mandate: number | null
  
  // Signals
  positive_signals: string[]
  risk_signals: string[]
  
  updated_at: string
}

export interface MandateActivationStrategy {
  mandate_id: string
  lead_id: string
  
  // Listing Strategy
  positioning_angle: string
  target_buyer_profile: string
  key_selling_points: string[]
  
  // Marketing
  recommended_channels: string[]
  ad_structure_suggestion: string
  photography_focus: string[]
  
  // Pricing
  pricing_strategy: 'aggressive' | 'market_rate' | 'premium'
  price_adjustment_trigger: string | null
  
  // Timeline
  recommended_launch_timing: string
  expected_market_time_days: number
  
  // Actions
  immediate_actions: string[]
  weekly_actions: string[]
  
  generated_at: string
}
