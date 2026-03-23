import { Activity, ActivityType } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

// PHASE 2: Using typed mock data with Supabase persistence
// TODO: Full Supabase integration when ready

const mockActivities: Activity[] = [
  // Marie Dupont activities
  {
    id: 'a1',
    lead_id: '11111111-1111-1111-1111-111111111111',
    buyer_id: null,
    match_id: null,
    mandate_id: null,
    created_at: '2024-03-10T08:00:00Z',
    type: 'lead',
    content: 'Lead created from referral by Jean Martin',
    operator_name: 'System',
  },
  {
    id: 'a2',
    lead_id: '11111111-1111-1111-1111-111111111111',
    buyer_id: null,
    match_id: null,
    mandate_id: null,
    created_at: '2024-03-12T14:00:00Z',
    type: 'email',
    content: 'Sent market analysis and comparable sales',
    operator_name: 'John Doe',
  },
  {
    id: 'a3',
    lead_id: '11111111-1111-1111-1111-111111111111',
    buyer_id: null,
    match_id: null,
    mandate_id: null,
    created_at: '2024-03-14T10:00:00Z',
    type: 'call',
    content: 'Discovery call - discussed timeline and motivation',
    operator_name: 'John Doe',
  },
  {
    id: 'a4',
    lead_id: '11111111-1111-1111-1111-111111111111',
    buyer_id: null,
    match_id: null,
    mandate_id: null,
    created_at: '2024-03-15T11:00:00Z',
    type: 'meeting',
    content: 'Property visit and condition assessment',
    operator_name: 'John Doe',
  },
  {
    id: 'a5',
    lead_id: '11111111-1111-1111-1111-111111111111',
    buyer_id: null,
    match_id: null,
    mandate_id: 'mandate-1',
    created_at: '2024-03-15T14:30:00Z',
    type: 'mandate',
    content: 'Exclusive mandate signed for 6 months',
    operator_name: 'John Doe',
  },
  // João Silva activities
  {
    id: 'a6',
    lead_id: '22222222-2222-2222-2222-222222222222',
    buyer_id: null,
    match_id: null,
    mandate_id: null,
    created_at: '2024-03-12T10:00:00Z',
    type: 'lead',
    content: 'Lead created from website inquiry',
    operator_name: 'System',
  },
  {
    id: 'a7',
    lead_id: '22222222-2222-2222-2222-222222222222',
    buyer_id: null,
    match_id: null,
    mandate_id: null,
    created_at: '2024-03-13T09:00:00Z',
    type: 'whatsapp',
    content: 'Initial WhatsApp message sent with market analysis',
    operator_name: 'John Doe',
  },
  {
    id: 'a8',
    lead_id: '22222222-2222-2222-2222-222222222222',
    buyer_id: null,
    match_id: null,
    mandate_id: null,
    created_at: '2024-03-15T16:00:00Z',
    type: 'call',
    content: 'Follow-up call - discussed pricing expectations',
    operator_name: 'John Doe',
  },
  // Buyer activities
  {
    id: 'a30',
    lead_id: null,
    buyer_id: 'buyer-1',
    match_id: null,
    mandate_id: null,
    created_at: '2026-01-15T10:30:00Z',
    type: 'buyer',
    content: 'Buyer registered - Marc Dubois, investor profile',
    operator_name: 'System',
  },
  {
    id: 'a31',
    lead_id: null,
    buyer_id: 'buyer-2',
    match_id: null,
    mandate_id: null,
    created_at: '2026-02-03T09:15:00Z',
    type: 'buyer',
    content: 'Relocation inquiry - Sarah Chen from Singapore',
    operator_name: 'System',
  },
  {
    id: 'a32',
    lead_id: null,
    buyer_id: 'buyer-1',
    match_id: 'match-1',
    mandate_id: null,
    created_at: '2026-03-18T10:00:00Z',
    type: 'match',
    content: 'Match identified: Marc Dubois ↔ Le Marais Loft (92% score)',
    operator_name: 'System',
  },
  {
    id: 'a33',
    lead_id: null,
    buyer_id: 'buyer-2',
    match_id: 'match-2',
    mandate_id: null,
    created_at: '2026-03-17T09:15:00Z',
    type: 'match',
    content: 'Match identified: Sarah Chen ↔ Neuilly property (78% score)',
    operator_name: 'System',
  },
  // Finance activities
  {
    id: 'a40',
    lead_id: null,
    buyer_id: 'buyer-1',
    match_id: null,
    mandate_id: null,
    created_at: '2026-01-20T10:00:00Z',
    type: 'finance',
    content: 'Finance profile created - pre-approved for 1M',
    operator_name: 'System',
  },
  {
    id: 'a41',
    lead_id: null,
    buyer_id: 'buyer-4',
    match_id: null,
    mandate_id: null,
    created_at: '2026-01-30T14:00:00Z',
    type: 'finance',
    content: 'Cash buyer verified - funds confirmed',
    operator_name: 'System',
  },
]

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

export async function getActivities(): Promise<Activity[]> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve([...mockActivities].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching activities:', error)
    return [...mockActivities].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }
  
  if (!data || data.length === 0) {
    return [...mockActivities].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }
  
  return data as Activity[]
}

export async function getActivitiesByLeadId(leadId: string): Promise<Activity[]> {
  if (!isSupabaseConfigured()) {
    const activities = mockActivities
      .filter(a => a.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return Promise.resolve([...activities])
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching activities by lead:', error)
    const activities = mockActivities
      .filter(a => a.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return [...activities]
  }
  
  // Merge with mock activities for this lead
  const mockForLead = mockActivities.filter(a => a.lead_id === leadId)
  const storedData = (data || []) as Activity[]
  const storedIds = new Set(storedData.map(a => a.id))
  const combined = [
    ...storedData,
    ...mockForLead.filter(a => !storedIds.has(a.id))
  ]
  
  return combined.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getActivitiesByBuyerId(buyerId: string): Promise<Activity[]> {
  if (!isSupabaseConfigured()) {
    const activities = mockActivities
      .filter(a => a.buyer_id === buyerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return Promise.resolve([...activities])
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching activities by buyer:', error)
    const activities = mockActivities
      .filter(a => a.buyer_id === buyerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return [...activities]
  }
  
  // Merge with mock activities for this buyer
  const mockForBuyer = mockActivities.filter(a => a.buyer_id === buyerId)
  const storedData = (data || []) as Activity[]
  const storedIds = new Set(storedData.map(a => a.id))
  const combined = [
    ...storedData,
    ...mockForBuyer.filter(a => !storedIds.has(a.id))
  ]
  
  return combined.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function addActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
  const newActivity: Activity = {
    ...activity,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }

  if (!isSupabaseConfigured()) {
    mockActivities.push(newActivity)
    return Promise.resolve(newActivity)
  }

  const supabase = createClient()
  const insertData = {
    id: newActivity.id,
    type: newActivity.type,
    content: newActivity.content,
    operator_name: newActivity.operator_name,
    lead_id: newActivity.lead_id,
    buyer_id: newActivity.buyer_id,
    match_id: newActivity.match_id,
    mandate_id: newActivity.mandate_id,
  }
  const { error } = await (supabase as any)
    .from('activities')
    .insert(insertData)
  
  if (error) {
    console.error('Error adding activity:', error)
    // Fallback to mock
    mockActivities.push(newActivity)
  }
  
  return newActivity
}
