import { Activity, ActivityType } from '@/types/database'

// PHASE 2: Using typed mock data
// TODO: Switch to Supabase when ready

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

export async function getActivities(): Promise<Activity[]> {
  return Promise.resolve([...mockActivities].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ))
}

export async function getActivitiesByLeadId(leadId: string): Promise<Activity[]> {
  const activities = mockActivities
    .filter(a => a.lead_id === leadId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return Promise.resolve([...activities])
}

export async function getActivitiesByBuyerId(buyerId: string): Promise<Activity[]> {
  const activities = mockActivities
    .filter(a => a.buyer_id === buyerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return Promise.resolve([...activities])
}

export async function addActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
  const newActivity: Activity = {
    ...activity,
    id: `new-${Date.now()}`,
    created_at: new Date().toISOString(),
  }
  mockActivities.push(newActivity)
  return Promise.resolve(newActivity)
}
