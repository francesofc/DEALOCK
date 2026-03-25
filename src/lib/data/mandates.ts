import { Mandate, MandateStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { runMatchGeneration } from '@/lib/intelligence/match-service'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

// Phase 7B: Get current workspace ID
function getCurrentWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('workspace_id')
}

export async function getMandates(workspaceId?: string | null): Promise<Mandate[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return Promise.resolve([])
  }

  const supabase = createClient()
  let query = supabase
    .from('mandates')
    .select('*')
    .order('created_at', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching mandates:', error)
    return []
  }

  return (data || []) as Mandate[]
}

export async function getMandateById(id: string, workspaceId?: string | null): Promise<Mandate | null> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = createClient()
  let query = supabase
    .from('mandates')
    .select('*')
    .eq('id', id)
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query.single()

  if (error) {
    return null
  }

  return data as Mandate
}

export async function getMandateByLeadId(leadId: string, workspaceId?: string | null): Promise<Mandate | null> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = createClient()
  let query = supabase
    .from('mandates')
    .select('*')
    .eq('lead_id', leadId)
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query.single()

  if (error) {
    if (error.code === 'PGRST116') return null
    return null
  }

  return data as Mandate
}

export async function getMandatesByStatus(status: MandateStatus, workspaceId?: string | null): Promise<Mandate[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('mandates')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching mandates by status:', error)
    return []
  }

  return (data || []) as Mandate[]
}

export async function getActiveMandates(workspaceId?: string | null): Promise<Mandate[]> {
  return getMandatesByStatus('signed', workspaceId)
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

async function syncLeadStatusWithMandate(leadId: string, mandateStatus: MandateStatus, workspaceId?: string | null): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, lead status sync skipped');
    return;
  }

  const newStatus = MANDATE_TO_LEAD_STATUS[mandateStatus];
  if (!newStatus) {
    console.warn(`Unknown mandate status: ${mandateStatus}`);
    return;
  }

  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  const supabase = createClient();
  
  let query = (supabase as any)
    .from('leads')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', leadId);
  
  // Phase 7B: Enforce workspace isolation
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId);
  }
  
  const { error } = await query;

  if (error) {
    console.error(`Failed to sync lead ${leadId} status to ${newStatus}:`, error);
  } else {
    console.log(`Synced lead ${leadId} status to ${newStatus}`);
  }
}

export async function createMandate(mandate: Mandate, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, mandate not created')
    throw new Error('Supabase not configured')
  }

  // Phase 7B: Require workspace context
  if (!currentWorkspaceId) {
    console.error('[Data Isolation] createMandate blocked: No workspace context')
    throw new Error('No workspace context. Cannot create mandate.')
  }

  const supabase = createClient()
  const insertData = {
    id: mandate.id,
    workspace_id: currentWorkspaceId, // Phase 7B: Associate with workspace
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
  await syncLeadStatusWithMandate(mandate.lead_id, mandate.status, currentWorkspaceId);

  // Auto-generate matches for all buyers against this new mandate in background
  try {
    console.log('[AutoMatch] Generating matches for new mandate:', mandate.id)
    runMatchGeneration().then(result => {
      console.log('[AutoMatch] Generated matches for new mandate:', result)
    }).catch(err => {
      console.error('[AutoMatch] Failed to generate matches for mandate:', err)
    })
  } catch (err) {
    // Non-blocking: match generation failure shouldn't break mandate creation
    console.error('[AutoMatch] Error triggering match generation:', err)
  }
}

export async function updateMandate(mandate: Mandate, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, mandate not updated')
    throw new Error('Supabase not configured')
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

  let query = (supabase as any)
    .from('mandates')
    .update(updateData)
    .eq('id', mandate.id)
  
  // Phase 7B: Enforce workspace isolation
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { error } = await query

  if (error) {
    console.error('Error updating mandate:', error)
    throw error
  }

  // CENTRALIZED: Always sync lead status after mandate update
  await syncLeadStatusWithMandate(mandate.lead_id, mandate.status, currentWorkspaceId);
}

export async function deleteMandate(id: string, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return
  }

  const supabase = createClient()
  
  let query = supabase
    .from('mandates')
    .delete()
    .eq('id', id)
  
  // Phase 7B: Enforce workspace isolation
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { error } = await query

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

  const currentWorkspaceId = getCurrentWorkspaceId()
  
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
    // Get all mandates for workspace
    let query = supabase.from('mandates').select('id, lead_id, status');
    
    if (currentWorkspaceId) {
      query = query.eq('workspace_id', currentWorkspaceId);
    }
    
    const { data: mandatesData, error: mandatesError } = await query;
    
    if (mandatesError) {
      result.errors.push(`Failed to fetch mandates: ${mandatesError.message}`);
      return result;
    }
    
    for (const mandate of (mandatesData || []) as Array<{ id: string; lead_id: string; status: MandateStatus }>) {
      const newStatus = statusMap[mandate.status];
      if (!newStatus) continue;
      
      // Update the related lead
      let updateQuery = (supabase as any)
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', mandate.lead_id);
      
      if (currentWorkspaceId) {
        updateQuery = updateQuery.eq('workspace_id', currentWorkspaceId);
      }
      
      const { error: updateError } = await updateQuery;
      
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
