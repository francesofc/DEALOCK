import { MatchOpportunity, MatchStatus, MatchScore } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

// Fallback mock match opportunities
export const mockMatches: MatchOpportunity[] = [
  {
    id: 'match-1',
    created_at: '2026-03-18T10:00:00Z',
    updated_at: '2026-03-19T14:30:00Z',
    buyer_id: 'buyer-1',
    target_type: 'seller',
    target_id: '11111111-1111-1111-1111-111111111111',
    seller_id: '11111111-1111-1111-1111-111111111111',
    mandate_id: null,
    match_score: 'excellent',
    score_value: 92,
    match_reasons: [
      'Budget alignment (buyer max: 1.2M, property: 1.15M)',
      'Target area match: Marais',
      'Property type: Loft matches buyer preference',
      'Buyer pre-approved and serious'
    ],
    blockers: [],
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
    target_type: 'mandate',
    target_id: 'm2',
    seller_id: '22222222-2222-2222-2222-222222222222',
    mandate_id: 'm2',
    match_score: 'good',
    score_value: 78,
    match_reasons: [
      'Location: Neuilly matches target area',
      'Timeline alignment: both immediate',
      'Property within budget range',
      'Relocation package = financial security'
    ],
    blockers: [],
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
    target_type: 'seller',
    target_id: 'lead-7',
    seller_id: 'lead-7',
    mandate_id: null,
    match_score: 'excellent',
    score_value: 88,
    match_reasons: [
      'Cash buyer - fast close possible',
      'Budget: 1.5M max, property: 1.35M',
      'Upgrading buyers want 7th/15th - perfect fit',
      '3 bedroom requirement met'
    ],
    blockers: [],
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
    target_type: 'mandate',
    target_id: 'm1',
    seller_id: '33333333-3333-3333-3333-333333333333',
    mandate_id: 'm1',
    match_score: 'fair',
    score_value: 65,
    match_reasons: [
      'Price slightly above buyer max (650k vs 625k)',
      'Barcelona location matches',
      'Good rental yield potential',
      'Buyer cash ready'
    ],
    blockers: ['Price gap of 25k'],
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
    target_type: 'seller',
    target_id: 'lead-6',
    seller_id: 'lead-6',
    mandate_id: null,
    match_score: 'good',
    score_value: 75,
    match_reasons: [
      'Downsizing buyer meets suburban property',
      'Price within range (500-700k)',
      'Both parties flexible on timing',
      'Retirement timeline aligns'
    ],
    blockers: [],
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
    target_type: 'seller',
    target_id: 'lead-2',
    seller_id: 'lead-2',
    mandate_id: null,
    match_score: 'weak',
    score_value: 45,
    match_reasons: [
      'Buyer budget max 500k, property 650k',
      'Location mismatch: buyer wants Lisbon'
    ],
    blockers: ['Budget gap of 150k', 'Wrong location'],
    status: 'archived',
    recommended_action: 'Keep buyer in pipeline for other properties',
    priority: 'low',
    notes: 'Not a current match. Buyer needs lower price point or different area.',
  },
]

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

export async function getMatches(): Promise<MatchOpportunity[]> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve([...mockMatches])
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_opportunities')
    .select('*')
    .order('score_value', { ascending: false })

  if (error) {
    console.error('Error fetching matches:', error)
    return [...mockMatches]
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchById(id: string): Promise<MatchOpportunity | null> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve(mockMatches.find(m => m.id === id) || null)
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_opportunities')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching match:', error)
    return mockMatches.find(m => m.id === id) || null
  }

  return data as MatchOpportunity
}

export async function getHighPriorityMatches(): Promise<MatchOpportunity[]> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve(mockMatches.filter(m => 
      m.priority === 'high' || m.priority === 'urgent'
    ))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_opportunities')
    .select('*')
    .in('priority', ['high', 'urgent'])
    .order('score_value', { ascending: false })

  if (error) {
    console.error('Error fetching high priority matches:', error)
    return mockMatches.filter(m => m.priority === 'high' || m.priority === 'urgent')
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchesByStatus(status: MatchStatus): Promise<MatchOpportunity[]> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve(mockMatches.filter(m => m.status === status))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_opportunities')
    .select('*')
    .eq('status', status)
    .order('score_value', { ascending: false })

  if (error) {
    console.error('Error fetching matches by status:', error)
    return mockMatches.filter(m => m.status === status)
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchesByBuyer(buyerId: string): Promise<MatchOpportunity[]> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve(mockMatches.filter(m => m.buyer_id === buyerId))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_opportunities')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('score_value', { ascending: false })

  if (error) {
    console.error('Error fetching matches by buyer:', error)
    return mockMatches.filter(m => m.buyer_id === buyerId)
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchesBySeller(sellerId: string): Promise<MatchOpportunity[]> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve(mockMatches.filter(m => m.seller_id === sellerId))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_opportunities')
    .select('*')
    .eq('target_type', 'seller')
    .eq('target_id', sellerId)
    .order('score_value', { ascending: false })

  if (error) {
    console.error('Error fetching matches by seller:', error)
    return mockMatches.filter(m => m.seller_id === sellerId)
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchesByMandate(mandateId: string): Promise<MatchOpportunity[]> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve(mockMatches.filter(m => m.mandate_id === mandateId))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_opportunities')
    .select('*')
    .eq('target_type', 'mandate')
    .eq('target_id', mandateId)
    .order('score_value', { ascending: false })

  if (error) {
    console.error('Error fetching matches by mandate:', error)
    return mockMatches.filter(m => m.mandate_id === mandateId)
  }

  return (data || []) as MatchOpportunity[]
}

export async function createMatch(match: MatchOpportunity): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, match created in memory only')
    mockMatches.push(match)
    return Promise.resolve()
  }

  const supabase = createClient()
  const insertData = {
    id: match.id,
    buyer_id: match.buyer_id,
    target_type: match.target_type,
    target_id: match.target_id,
    match_score: match.match_score,
    score_value: match.score_value,
    match_reasons: match.match_reasons,
    blockers: match.blockers,
    status: match.status,
    priority: match.priority,
    recommended_action: match.recommended_action,
    notes: match.notes,
  }

  const { error } = await (supabase as any)
    .from('match_opportunities')
    .insert(insertData)

  if (error) {
    console.error('Error creating match:', error)
    throw error
  }
}

export async function updateMatch(match: MatchOpportunity): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, match updated in memory only')
    const index = mockMatches.findIndex(m => m.id === match.id)
    if (index !== -1) {
      mockMatches[index] = { ...match, updated_at: new Date().toISOString() }
    }
    return Promise.resolve()
  }

  const supabase = createClient()
  const updateData = {
    buyer_id: match.buyer_id,
    target_type: match.target_type,
    target_id: match.target_id,
    match_score: match.match_score,
    score_value: match.score_value,
    match_reasons: match.match_reasons,
    blockers: match.blockers,
    status: match.status,
    priority: match.priority,
    recommended_action: match.recommended_action,
    notes: match.notes,
    updated_at: new Date().toISOString(),
  }

  const { error } = await (supabase as any)
    .from('match_opportunities')
    .update(updateData)
    .eq('id', match.id)

  if (error) {
    console.error('Error updating match:', error)
    throw error
  }
}

export async function deleteMatch(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = mockMatches.findIndex(m => m.id === id)
    if (index !== -1) mockMatches.splice(index, 1)
    return Promise.resolve()
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('match_opportunities')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting match:', error)
    throw error
  }
}
