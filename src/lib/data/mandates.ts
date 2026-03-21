import { Mandate, MandateStatus } from '@/types/database'

// PHASE 2: Using typed mock data
// TODO: Switch to Supabase when ready

const mockMandates: Mandate[] = [
  {
    id: 'm1',
    lead_id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-03-15T10:30:00Z',
    agency_name: 'Premium Real Estate Lyon',
    exclusive: true,
    signing_mode: 'electronic',
    status: 'signed',
    signed_at: '2024-03-15T10:30:00Z',
    notes: '6-month exclusive mandate. Full marketing package included.',
  },
  {
    id: 'm2',
    lead_id: '22222222-2222-2222-2222-222222222222',
    created_at: '2024-03-19T16:00:00Z',
    agency_name: 'Premium Real Estate Cascais',
    exclusive: true,
    signing_mode: 'physical',
    status: 'sent',
    signed_at: null,
    notes: 'Waiting for client to sign and return. Proposed 6 months exclusive.',
  },
  {
    id: 'm3',
    lead_id: '33333333-3333-3333-3333-333333333333',
    created_at: '2024-03-20T11:00:00Z',
    agency_name: 'Premium Real Estate Paris',
    exclusive: false,
    signing_mode: 'electronic',
    status: 'draft',
    signed_at: null,
    notes: 'Non-exclusive option prepared. Client prefers flexibility.',
  },
  {
    id: 'm4',
    lead_id: '88888888-8888-8888-8888-888888888888',
    created_at: '2024-01-15T14:00:00Z',
    agency_name: 'Premium Real Estate Lisbon',
    exclusive: true,
    signing_mode: 'electronic',
    status: 'expired',
    signed_at: '2024-01-15T14:00:00Z',
    notes: 'Mandate expired. Client did not renew, went with competitor.',
  },
]

export async function getMandates(): Promise<Mandate[]> {
  return Promise.resolve([...mockMandates].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ))
}

export async function getMandateByLeadId(leadId: string): Promise<Mandate | null> {
  const mandate = mockMandates.find(m => m.lead_id === leadId)
  return Promise.resolve(mandate || null)
}

export async function getMandatesByStatus(status: MandateStatus): Promise<Mandate[]> {
  const mandates = mockMandates.filter(m => m.status === status)
  return Promise.resolve([...mandates])
}

export async function getActiveMandates(): Promise<Mandate[]> {
  const mandates = mockMandates.filter(m => m.status === 'signed')
  return Promise.resolve([...mandates])
}
