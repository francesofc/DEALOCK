import { MatchOpportunity, MatchStatus, MatchScore } from '@/types/database'

// Mock match opportunities for Dealock match intelligence layer
export const mockMatches: MatchOpportunity[] = [
  {
    id: 'match-1',
    created_at: '2026-03-18T10:00:00Z',
    updated_at: '2026-03-19T14:30:00Z',
    buyer_id: 'buyer-1',
    seller_id: 'lead-1',
    mandate_id: null,
    match_score: 'excellent',
    match_score_value: 92,
    match_reasons: [
      'Budget alignment (buyer max: 1.2M, property: 1.15M)',
      'Target area match: Marais',
      'Property type: Loft matches buyer preference',
      'Buyer pre-approved and serious'
    ],
    status: 'contacted_buyer',
    recommended_action: 'Schedule viewing this week',
    priority: 'urgent',
    notes: 'Buyer Marc Dubois has been looking for 2 months. This property fits perfectly.',
  },
  {
    id: 'match-2',
    created_at: '2026-03-17T09:15:00Z',
    updated_at: '2026-03-19T11:00:00Z',
    buyer_id: 'buyer-2',
    seller_id: 'lead-4',
    mandate_id: 'mandate-2',
    match_score: 'good',
    match_score_value: 78,
    match_reasons: [
      'Location: Neuilly matches target area',
      'Timeline alignment: both immediate',
      'Property within budget range',
      'Relocation package = financial security'
    ],
    status: 'viewing_scheduled',
    recommended_action: 'Prepare neighborhood guide for viewing',
    priority: 'high',
    notes: 'Viewing confirmed for March 22. Seller motivated (180 DOM).',
  },
  {
    id: 'match-3',
    created_at: '2026-03-15T16:30:00Z',
    updated_at: '2026-03-18T10:00:00Z',
    buyer_id: 'buyer-4',
    seller_id: 'lead-7',
    mandate_id: null,
    match_score: 'excellent',
    match_score_value: 88,
    match_reasons: [
      'Cash buyer - fast close possible',
      'Budget: 1.5M max, property: 1.35M',
      'Upgrading buyers want 7th/15th - perfect fit',
      '3 bedroom requirement met'
    ],
    status: 'offer_received',
    recommended_action: 'Present counter-offer of 1.28M',
    priority: 'urgent',
    notes: 'Offer received at 1.2M. Seller wants 1.35M. Room for negotiation.',
  },
  {
    id: 'match-4',
    created_at: '2026-03-16T11:20:00Z',
    updated_at: '2026-03-19T09:45:00Z',
    buyer_id: 'buyer-6',
    seller_id: 'lead-3',
    mandate_id: 'mandate-1',
    match_score: 'fair',
    match_score_value: 65,
    match_reasons: [
      'Price slightly above buyer max (650k vs 625k)',
      'Barcelona location matches',
      'Good rental yield potential',
      'Buyer cash ready'
    ],
    status: 'identified',
    recommended_action: 'Contact buyer about price flexibility',
    priority: 'medium',
    notes: 'Price gap of 25k. Buyer might stretch for right property.',
  },
  {
    id: 'match-5',
    created_at: '2026-03-14T14:00:00Z',
    updated_at: '2026-03-18T16:00:00Z',
    buyer_id: 'buyer-5',
    seller_id: 'lead-6',
    mandate_id: null,
    match_score: 'good',
    match_score_value: 75,
    match_reasons: [
      'Downsizing buyer meets suburban property',
      'Price within range (500-700k)',
      'Both parties flexible on timing',
      'Retirement timeline aligns'
    ],
    status: 'contacted_buyer',
    recommended_action: 'Schedule weekend viewing',
    priority: 'medium',
    notes: 'Both parties not in rush. Good match for patient negotiation.',
  },
  {
    id: 'match-6',
    created_at: '2026-03-12T10:30:00Z',
    updated_at: '2026-03-17T11:00:00Z',
    buyer_id: 'buyer-3',
    seller_id: 'lead-2',
    mandate_id: null,
    match_score: 'weak',
    match_score_value: 45,
    match_reasons: [
      'Buyer budget max 500k, property 650k',
      'Location mismatch: buyer wants Lisbon',
      'First-time buyer may struggle with process',
      'Seller wants quick close'
    ],
    status: 'archived',
    recommended_action: 'Keep buyer in pipeline for other properties',
    priority: 'low',
    notes: 'Not a current match. Buyer needs lower price point or different area.',
  },
]

export async function getMatches(): Promise<MatchOpportunity[]> {
  return mockMatches
}

export async function getMatchById(id: string): Promise<MatchOpportunity | null> {
  return mockMatches.find(m => m.id === id) || null
}

export async function getHighPriorityMatches(): Promise<MatchOpportunity[]> {
  return mockMatches.filter(m => 
    m.priority === 'high' || m.priority === 'urgent'
  )
}

export async function getMatchesByStatus(status: MatchStatus): Promise<MatchOpportunity[]> {
  return mockMatches.filter(m => m.status === status)
}

export async function getMatchesByBuyer(buyerId: string): Promise<MatchOpportunity[]> {
  return mockMatches.filter(m => m.buyer_id === buyerId)
}

export async function getMatchesBySeller(sellerId: string): Promise<MatchOpportunity[]> {
  return mockMatches.filter(m => m.seller_id === sellerId)
}
