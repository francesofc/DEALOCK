import { Mandate, MandateStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

// Fallback mock data when Supabase is not available
const mockMandates: Mandate[] = [
  {
    id: 'm1',
    lead_id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-03-15T10:30:00Z',
    updated_at: '2024-03-15T10:30:00Z',
    agency_name: 'Premium Real Estate Lyon',
    exclusive: true,
    signing_mode: 'electronic',
    status: 'signed',
    signed_at: '2024-03-15T10:30:00Z',
    notes: '6-month exclusive mandate. Full marketing package included.',
    title: 'Loft Marais',
    asking_price: 1150000,
    city: 'Lyon',
    neighborhood: 'Marais',
    property_type: 'loft',
    area_m2: 120,
    bedrooms: 2,
  },
  {
    id: 'm2',
    lead_id: '22222222-2222-2222-2222-222222222222',
    created_at: '2024-03-19T16:00:00Z',
    updated_at: '2024-03-19T16:00:00Z',
    agency_name: 'Premium Real Estate Cascais',
    exclusive: true,
    signing_mode: 'physical',
    status: 'sent',
    signed_at: null,
    notes: 'Waiting for client to sign and return. Proposed 6 months exclusive.',
    title: 'Villa Cascais',
    asking_price: 850000,
    city: 'Cascais',
    neighborhood: 'Central',
    property_type: 'villa',
    area_m2: 250,
    bedrooms: 4,
  },
  {
    id: 'm3',
    lead_id: '33333333-3333-3333-3333-333333333333',
    created_at: '2024-03-20T11:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
    agency_name: 'Premium Real Estate Paris',
    exclusive: false,
    signing_mode: 'electronic',
    status: 'draft',
    signed_at: null,
    notes: 'Non-exclusive option prepared. Client prefers flexibility.',
    title: 'Apartment Paris 15th',
    asking_price: 650000,
    city: 'Paris',
    neighborhood: '15th Arrondissement',
    property_type: 'apartment',
    area_m2: 65,
    bedrooms: 2,
  },
  {
    id: 'm4',
    lead_id: '88888888-8888-8888-8888-888888888888',
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z',
    agency_name: 'Premium Real Estate Lisbon',
    exclusive: true,
    signing_mode: 'electronic',
    status: 'expired',
    signed_at: '2024-01-15T14:00:00Z',
    notes: 'Mandate expired. Client did not renew, went with competitor.',
    title: 'Lisbon Apartment',
    asking_price: 450000,
    city: 'Lisbon',
    neighborhood: 'Alfama',
    property_type: 'apartment',
    area_m2: 85,
    bedrooms: 2,
  },
]

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

export async function getMandates(): Promise<Mandate[]> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve([...mockMandates].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('mandates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mandates:', error)
    return [...mockMandates]
  }

  return (data || []) as Mandate[]
}

export async function getMandateById(id: string): Promise<Mandate | null> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve(mockMandates.find(m => m.id === id) || null)
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('mandates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching mandate:', error)
    return mockMandates.find(m => m.id === id) || null
  }

  return data as Mandate
}

export async function getMandateByLeadId(leadId: string): Promise<Mandate | null> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve(mockMandates.find(m => m.lead_id === leadId) || null)
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('mandates')
    .select('*')
    .eq('lead_id', leadId)
    .single()

  if (error) {
    // No mandate found is not an error
    if (error.code === 'PGRST116') return null
    console.error('Error fetching mandate by lead:', error)
    return mockMandates.find(m => m.lead_id === leadId) || null
  }

  return data as Mandate
}

export async function getMandatesByStatus(status: MandateStatus): Promise<Mandate[]> {
  if (!isSupabaseConfigured()) {
    return Promise.resolve(mockMandates.filter(m => m.status === status))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('mandates')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mandates by status:', error)
    return mockMandates.filter(m => m.status === status)
  }

  return (data || []) as Mandate[]
}

export async function getActiveMandates(): Promise<Mandate[]> {
  return getMandatesByStatus('signed')
}

// ============================================
// CENTRALIZED: Sync lead.status with mandate.status
// ============================================

const MANDATE_TO_LEAD_STATUS: Record<MandateStatus, string> = {
  'draft': 'mandate_proposed',
  'sent': 'mandate_sent',
  'signed': 'mandate_signed',
  'expired': 'mandate_proposed',
  'terminated': 'mandate_proposed',
};

async function syncLeadStatusWithMandate(leadId: string, mandateStatus: MandateStatus): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, lead status sync skipped');
    return;
  }

  const newStatus = MANDATE_TO_LEAD_STATUS[mandateStatus];
  if (!newStatus) {
    console.warn(`Unknown mandate status: ${mandateStatus}`);
    return;
  }

  const supabase = createClient();
  const { error } = await (supabase as any)
    .from('leads')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', leadId);

  if (error) {
    console.error(`Failed to sync lead ${leadId} status to ${newStatus}:`, error);
    // Don't throw - mandate creation should succeed even if sync fails
  } else {
    console.log(`Synced lead ${leadId} status to ${newStatus}`);
  }
}

export async function createMandate(mandate: Mandate): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, mandate created in memory only')
    mockMandates.push(mandate)
    return Promise.resolve()
  }

  const supabase = createClient()
  const insertData = {
    id: mandate.id,
    lead_id: mandate.lead_id,
    agency_name: mandate.agency_name,
    exclusive: mandate.exclusive,
    signing_mode: mandate.signing_mode,
    status: mandate.status,
    signed_at: mandate.signed_at,
    notes: mandate.notes,
    title: mandate.title,
    asking_price: mandate.asking_price,
    city: mandate.city,
    neighborhood: mandate.neighborhood,
    property_type: mandate.property_type,
    area_m2: mandate.area_m2,
    bedrooms: mandate.bedrooms,
  }

  const { error } = await (supabase as any)
    .from('mandates')
    .insert(insertData)

  if (error) {
    console.error('Error creating mandate:', error)
    throw error
  }

  // CENTRALIZED: Always sync lead status after mandate creation
  await syncLeadStatusWithMandate(mandate.lead_id, mandate.status);
}

export async function updateMandate(mandate: Mandate): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, mandate updated in memory only')
    const index = mockMandates.findIndex(m => m.id === mandate.id)
    if (index !== -1) {
      mockMandates[index] = { ...mandate, updated_at: new Date().toISOString() }
    }
    return Promise.resolve()
  }

  const supabase = createClient()
  const updateData = {
    lead_id: mandate.lead_id,
    agency_name: mandate.agency_name,
    exclusive: mandate.exclusive,
    signing_mode: mandate.signing_mode,
    status: mandate.status,
    signed_at: mandate.signed_at,
    notes: mandate.notes,
    title: mandate.title,
    asking_price: mandate.asking_price,
    city: mandate.city,
    neighborhood: mandate.neighborhood,
    property_type: mandate.property_type,
    area_m2: mandate.area_m2,
    bedrooms: mandate.bedrooms,
    updated_at: new Date().toISOString(),
  }

  const { error } = await (supabase as any)
    .from('mandates')
    .update(updateData)
    .eq('id', mandate.id)

  if (error) {
    console.error('Error updating mandate:', error)
    throw error
  }

  // CENTRALIZED: Always sync lead status after mandate update
  await syncLeadStatusWithMandate(mandate.lead_id, mandate.status);
}

export async function deleteMandate(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = mockMandates.findIndex(m => m.id === id)
    if (index !== -1) mockMandates.splice(index, 1)
    return Promise.resolve()
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('mandates')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mandate:', error)
    throw error
  }
}

// ============================================
// BACKFILL: Sync lead.status with mandate.status
// ============================================

export async function backfillLeadStatusesFromMandates(): Promise<{ updated: number; errors: string[] }> {
  const result = { updated: 0, errors: [] as string[] };
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, backfill skipped');
    return result;
  }

  const supabase = createClient();
  
  // Map mandate status to lead status
  const statusMap: Record<MandateStatus, string> = {
    'draft': 'mandate_proposed',
    'sent': 'mandate_sent',
    'signed': 'mandate_signed',
    'expired': 'mandate_proposed',
    'terminated': 'mandate_proposed',
  };
  
  try {
    // Get all mandates
    const { data: mandatesData, error: mandatesError } = await supabase
      .from('mandates')
      .select('id, lead_id, status');
    
    if (mandatesError) {
      result.errors.push(`Failed to fetch mandates: ${mandatesError.message}`);
      return result;
    }
    
    for (const mandate of (mandatesData || []) as Array<{ id: string; lead_id: string; status: MandateStatus }>) {
      const newStatus = statusMap[mandate.status];
      if (!newStatus) continue;
      
      // Update the related lead
      const { error: updateError } = await (supabase as any)
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', mandate.lead_id);
      
      if (updateError) {
        result.errors.push(`Failed to update lead ${mandate.lead_id}: ${updateError.message}`);
      } else {
        result.updated++;
      }
    }
    
    console.log(`Backfill complete: ${result.updated} leads updated`);
    if (result.errors.length > 0) {
      console.error('Backfill errors:', result.errors);
    }
    
  } catch (err) {
    result.errors.push(`Unexpected error: ${err}`);
  }
  
  return result;
}
