// Seller Intelligence Mock Data
// Transitional layer - simulates AI analysis outputs

import { 
  SellerIntelligence, 
  SellerMindset, 
  RelationshipState, 
  DealMomentum,
  RecommendedAngle,
  ToneGuidance,
  NextBestMove,
  TimingRecommendation,
} from '@/types/seller-intelligence'

// Generate intelligence for a lead based on its characteristics
export function generateIntelligenceForLead(leadId: string, leadData: {
  status: string
  priority_score: number | null
  seller_profile: string | null
  days_on_market_estimate: number | null
  language_preference: string
}): SellerIntelligence {
  // Default values
  let mindset: SellerMindset = 'exploratory'
  let relationship: RelationshipState = 'cold'
  let momentum: DealMomentum = 'weak'
  let angle: RecommendedAngle = 'service_premium'
  let tone: ToneGuidance = 'professional_confident'
  let nextMove: NextBestMove = 'send_market_analysis'
  let timing: TimingRecommendation = 'this_week'
  
  // Logic based on lead status
  switch (leadData.status) {
    case 'new':
      mindset = 'exploratory'
      relationship = 'cold'
      momentum = 'weak'
      angle = 'market_expert'
      tone = 'professional_confident'
      nextMove = 'send_market_analysis'
      timing = 'today'
      break
    case 'qualified':
      mindset = 'rational'
      relationship = 'neutral'
      momentum = 'stable'
      angle = 'data_driven'
      tone = 'consultative'
      nextMove = 'schedule_call'
      timing = 'today'
      break
    case 'contacted':
      mindset = 'exploratory'
      relationship = 'neutral'
      momentum = 'stable'
      angle = 'problem_solver'
      tone = 'warm_personal'
      nextMove = 'follow_up_email'
      timing = 'tomorrow'
      break
    case 'replied':
      mindset = 'exploratory'
      relationship = 'engaged'
      momentum = 'improving'
      angle = 'reassurance'
      tone = 'patient_supportive'
      nextMove = 'schedule_call'
      timing = 'today'
      break
    case 'call_scheduled':
      mindset = 'rational'
      relationship = 'engaged'
      momentum = 'improving'
      angle = 'service_premium'
      tone = 'professional_confident'
      nextMove = 'schedule_meeting'
      timing = 'this_week'
      break
    case 'mandate_proposed':
      mindset = 'rational'
      relationship = 'developing_trust'
      momentum = 'near_mandate'
      angle = 'exclusivity_value'
      tone = 'professional_confident'
      nextMove = 'address_objection'
      timing = 'today'
      break
    case 'mandate_sent':
      mindset = 'urgent'
      relationship = 'hesitant'
      momentum = 'near_mandate'
      angle = 'reassurance'
      tone = 'patient_supportive'
      nextMove = 'follow_up_email'
      timing = 'tomorrow'
      break
    case 'mandate_signed':
      mindset = 'premium_expectations'
      relationship = 'strong_rapport'
      momentum = 'accelerating'
      angle = 'problem_solver'
      tone = 'premium_exclusive'
      nextMove = 'wait_and_nurture'
      timing = 'next_week'
      break
    case 'lost':
      mindset = 'disappointed'
      relationship = 'cold'
      momentum = 'weak'
      angle = 'reassurance'
      tone = 'patient_supportive'
      nextMove = 'reactivate'
      timing = 'next_week'
      break
  }
  
  // Adjust based on priority score
  if (leadData.priority_score && leadData.priority_score > 0.85) {
    if (momentum !== 'accelerating') momentum = 'improving'
    if (relationship === 'cold') relationship = 'neutral'
  }
  
  // Generate content based on language
  const lang = leadData.language_preference || 'en'
  
  const openingMessages: Record<string, string> = {
    en: "I noticed your property in {city} and wanted to share some insights about the current market. Properties like yours are moving quickly right now.",
    fr: "J'ai remarqué votre bien à {city} et je souhaitais partager quelques insights sur le marché actuel. Les biens comme le vôtre se vendent rapidement en ce moment.",
    pt: "Notei o seu imóvel em {city} e queria partilhar alguns insights sobre o mercado atual. Imóveis como o seu estão a vender rapidamente neste momento.",
    es: "Noté su propiedad en {city} y quería compartir algunos insights sobre el mercado actual. Propiedades como la suya se están vendiendo rápidamente.",
  }
  
  const keyPoints: Record<string, string[]> = {
    en: [
      "Market is favorable for sellers in this area",
      "Similar properties sold within 45 days",
      "Renovated kitchen adds 5-8% value",
      "Professional staging recommended"
    ],
    fr: [
      "Le marché est favorable aux vendeurs dans ce quartier",
      "Biens similaires vendus en 45 jours",
      "Cuisine rénovée ajoute 5-8% de valeur",
      "Home staging professionnel recommandé"
    ],
    pt: [
      "O mercado é favorável para vendedores nesta zona",
      "Imóveis similares vendidos em 45 dias",
      "Cozinha renovada acrescenta 5-8% de valor",
      "Home staging profissional recomendado"
    ],
    es: [
      "El mercado es favorable para vendedores en esta zona",
      "Propiedades similares vendidas en 45 días",
      "Cocina renovada añade 5-8% de valor",
      "Home staging profesional recomendado"
    ],
  }
  
  const avoidList: Record<string, string[]> = {
    en: [
      "Don't mention specific price reductions yet",
      "Avoid comparing to failed listings",
      "Don't rush the exclusivity conversation"
    ],
    fr: [
      "Ne pas mentionner de baisses de prix spécifiques",
      "Éviter les comparaisons avec annonces échouées",
      "Ne pas précipiter la conversation sur l'exclusivité"
    ],
    pt: [
      "Não mencionar reduções de preço específicas",
      "Evitar comparações com anúncios falhados",
      "Não apressar a conversa sobre exclusividade"
    ],
    es: [
      "No mencionar reducciones de precio específicas",
      "Evitar comparaciones con anuncios fallidos",
      "No apresurar la conversación sobre exclusividad"
    ],
  }
  
  // Calculate mandate readiness
  const mandateReadiness = calculateMandateReadiness(leadData.status, leadData.priority_score)
  
  // Exclusivity potential
  let exclusivityPotential: 'low' | 'medium' | 'high' | 'very_high' = 'medium'
  if (mandateReadiness > 80) exclusivityPotential = 'very_high'
  else if (mandateReadiness > 60) exclusivityPotential = 'high'
  else if (mandateReadiness < 40) exclusivityPotential = 'low'
  
  return {
    lead_id: leadId,
    seller_mindset: mindset,
    relationship_state: relationship,
    deal_momentum: momentum,
    recommended_angle: angle,
    tone_to_use: tone,
    next_best_move: nextMove,
    suggested_timing: timing,
    suggested_opening: openingMessages[lang] || openingMessages.en,
    key_talking_points: keyPoints[lang] || keyPoints.en,
    what_to_avoid: avoidList[lang] || avoidList.en,
    objection_prep: {
      price: "Market data shows this is priced competitively",
      timeline: "We can work with your timeline - let's discuss your ideal schedule",
      commission: "My fee includes premium marketing and dedicated service"
    },
    mandate_readiness_score: mandateReadiness,
    exclusivity_potential: exclusivityPotential,
    estimated_days_to_mandate: estimateDaysToMandate(leadData.status, momentum),
    positive_signals: generatePositiveSignals(leadData),
    risk_signals: generateRiskSignals(leadData),
    updated_at: new Date().toISOString(),
  }
}

function calculateMandateReadiness(status: string, priorityScore: number | null): number {
  const statusScores: Record<string, number> = {
    'new': 10,
    'qualified': 25,
    'contacted': 35,
    'replied': 50,
    'call_scheduled': 65,
    'mandate_proposed': 80,
    'mandate_sent': 90,
    'mandate_signed': 100,
    'lost': 0,
  }
  
  let baseScore = statusScores[status] || 10
  
  // Adjust by priority score
  if (priorityScore) {
    baseScore = Math.min(100, baseScore + (priorityScore * 20))
  }
  
  return Math.round(baseScore)
}

function estimateDaysToMandate(status: string, momentum: DealMomentum): number | null {
  const baseEstimates: Record<string, number> = {
    'new': 45,
    'qualified': 30,
    'contacted': 21,
    'replied': 14,
    'call_scheduled': 10,
    'mandate_proposed': 7,
    'mandate_sent': 3,
    'mandate_signed': 0,
    'lost': 0,
  }
  
  let base = baseEstimates[status]
  if (base === null) return null
  
  // Adjust by momentum
  const momentumMultiplier: Record<DealMomentum, number> = {
    'weak': 1.5,
    'stable': 1,
    'improving': 0.8,
    'near_mandate': 0.5,
    'at_risk': 2,
    'accelerating': 0.4,
  }
  
  return Math.round(base * (momentumMultiplier[momentum] || 1))
}

function generatePositiveSignals(leadData: { seller_profile: string | null; status: string }): string[] {
  const signals: string[] = []
  
  if (leadData.seller_profile?.includes('motivated')) {
    signals.push('High motivation level indicated')
  }
  if (leadData.seller_profile?.includes('renovated')) {
    signals.push('Recently renovated - selling advantage')
  }
  if (leadData.seller_profile?.includes('exclusivity')) {
    signals.push('Open to exclusivity discussion')
  }
  if (['replied', 'call_scheduled', 'mandate_proposed'].includes(leadData.status)) {
    signals.push('Responsive and engaged')
  }
  
  if (signals.length === 0) {
    signals.push('Lead is actively looking for representation')
  }
  
  return signals
}

function generateRiskSignals(leadData: { 
  seller_profile: string | null; 
  status: string;
  days_on_market_estimate: number | null;
}): string[] {
  const signals: string[] = []
  
  if (leadData.seller_profile?.includes('above market')) {
    signals.push('Price expectations may be high')
  }
  if (leadData.seller_profile?.includes('multiple agents')) {
    signals.push('Talking to multiple agents')
  }
  if (leadData.days_on_market_estimate && leadData.days_on_market_estimate > 90) {
    signals.push('Property may be stale on market')
  }
  if (leadData.status === 'lost') {
    signals.push('Previously lost to competitor')
  }
  
  return signals
}

// Get all intelligence for a lead
export async function getLeadIntelligence(leadId: string, leadData: any): Promise<SellerIntelligence> {
  // Simulate API delay (skip in test mode for faster E2E tests)
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') {
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  return generateIntelligenceForLead(leadId, leadData)
}
