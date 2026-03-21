import { Activity, ActivityType } from '@/types/database'

// PHASE 2: Using typed mock data
// TODO: Switch to Supabase when ready

const mockActivities: Activity[] = [
  // Marie Dupont activities
  {
    id: 'a1',
    lead_id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-03-10T08:00:00Z',
    type: 'lead',
    content: 'Lead created from referral by Jean Martin',
    operator_name: 'System',
  },
  {
    id: 'a2',
    lead_id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-03-12T14:00:00Z',
    type: 'email',
    content: 'Sent market analysis and comparable sales',
    operator_name: 'John Doe',
  },
  {
    id: 'a3',
    lead_id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-03-14T10:00:00Z',
    type: 'call',
    content: 'Discovery call - discussed timeline and motivation',
    operator_name: 'John Doe',
  },
  {
    id: 'a4',
    lead_id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-03-15T11:00:00Z',
    type: 'meeting',
    content: 'Property visit and condition assessment',
    operator_name: 'John Doe',
  },
  {
    id: 'a5',
    lead_id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-03-15T14:30:00Z',
    type: 'mandate',
    content: 'Exclusive mandate signed for 6 months',
    operator_name: 'John Doe',
  },
  // João Silva activities
  {
    id: 'a6',
    lead_id: '22222222-2222-2222-2222-222222222222',
    created_at: '2024-03-12T10:00:00Z',
    type: 'lead',
    content: 'Lead created from website inquiry',
    operator_name: 'System',
  },
  {
    id: 'a7',
    lead_id: '22222222-2222-2222-2222-222222222222',
    created_at: '2024-03-13T09:00:00Z',
    type: 'whatsapp',
    content: 'Initial WhatsApp message sent with market analysis',
    operator_name: 'John Doe',
  },
  {
    id: 'a8',
    lead_id: '22222222-2222-2222-2222-222222222222',
    created_at: '2024-03-15T16:00:00Z',
    type: 'call',
    content: 'Follow-up call - discussed pricing expectations',
    operator_name: 'John Doe',
  },
  {
    id: 'a9',
    lead_id: '22222222-2222-2222-2222-222222222222',
    created_at: '2024-03-19T14:00:00Z',
    type: 'email',
    content: 'Sent exclusivity proposal with marketing plan',
    operator_name: 'John Doe',
  },
  // Emma Johnson activities
  {
    id: 'a10',
    lead_id: '33333333-3333-3333-3333-333333333333',
    created_at: '2024-03-14T09:00:00Z',
    type: 'lead',
    content: 'Lead created from Instagram ad',
    operator_name: 'System',
  },
  {
    id: 'a11',
    lead_id: '33333333-3333-3333-3333-333333333333',
    created_at: '2024-03-15T10:00:00Z',
    type: 'email',
    content: 'Sent introduction and credentials',
    operator_name: 'John Doe',
  },
  {
    id: 'a12',
    lead_id: '33333333-3333-3333-3333-333333333333',
    created_at: '2024-03-20T11:00:00Z',
    type: 'call',
    content: 'Scheduled for tomorrow - pricing discussion',
    operator_name: 'John Doe',
  },
  // Carlos Mendes activities
  {
    id: 'a13',
    lead_id: '44444444-4444-4444-4444-444444444444',
    created_at: '2024-03-08T14:00:00Z',
    type: 'lead',
    content: 'Lead from email campaign #3',
    operator_name: 'System',
  },
  {
    id: 'a14',
    lead_id: '44444444-4444-4444-4444-444444444444',
    created_at: '2024-03-10T09:00:00Z',
    type: 'email',
    content: 'Initial outreach sent',
    operator_name: 'John Doe',
  },
  {
    id: 'a15',
    lead_id: '44444444-4444-4444-4444-444444444444',
    created_at: '2024-03-18T10:00:00Z',
    type: 'note',
    content: 'Auto-reply: out of office until next week',
    operator_name: 'System',
  },
  // Sophie Martin activities
  {
    id: 'a16',
    lead_id: '55555555-5555-5555-5555-555555555555',
    created_at: '2024-03-16T11:00:00Z',
    type: 'lead',
    content: 'Referral from Marie Dupont',
    operator_name: 'System',
  },
  {
    id: 'a17',
    lead_id: '55555555-5555-5555-5555-555555555555',
    created_at: '2024-03-17T14:00:00Z',
    type: 'call',
    content: 'Initial consultation - explained situation',
    operator_name: 'John Doe',
  },
  {
    id: 'a18',
    lead_id: '55555555-5555-5555-5555-555555555555',
    created_at: '2024-03-17T15:00:00Z',
    type: 'note',
    content: 'Requires discretion due to divorce proceedings',
    operator_name: 'John Doe',
  },
  // Lucas Pereira activities
  {
    id: 'a19',
    lead_id: '66666666-6666-6666-6666-666666666666',
    created_at: '2024-03-15T13:00:00Z',
    type: 'lead',
    content: 'Website inquiry - first-time seller',
    operator_name: 'System',
  },
  {
    id: 'a20',
    lead_id: '66666666-6666-6666-6666-666666666666',
    created_at: '2024-03-16T10:00:00Z',
    type: 'whatsapp',
    content: 'Sent welcome message and process overview',
    operator_name: 'John Doe',
  },
  // Ana Costa activities
  {
    id: 'a21',
    lead_id: '77777777-7777-7777-7777-777777777777',
    created_at: '2024-03-20T08:00:00Z',
    type: 'lead',
    content: 'Walk-in prospect at office',
    operator_name: 'System',
  },
  // Pedro Santos activities
  {
    id: 'a22',
    lead_id: '88888888-8888-8888-8888-888888888888',
    created_at: '2024-03-01T09:00:00Z',
    type: 'lead',
    content: 'Portal lead - already talking to other agents',
    operator_name: 'System',
  },
  {
    id: 'a23',
    lead_id: '88888888-8888-8888-8888-888888888888',
    created_at: '2024-03-15T10:00:00Z',
    type: 'note',
    content: 'Lead lost - chose competitor',
    operator_name: 'John Doe',
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

export async function addActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
  const newActivity: Activity = {
    ...activity,
    id: `new-${Date.now()}`,
    created_at: new Date().toISOString(),
  }
  mockActivities.push(newActivity)
  return Promise.resolve(newActivity)
}
