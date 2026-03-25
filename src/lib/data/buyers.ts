import { Buyer, BuyerStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { generateMatchesForBuyer } from '@/lib/intelligence/match-service'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

// Phase 7B: Get current workspace ID from localStorage (fallback until profile integration)
function getCurrentWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('workspace_id')
}

// Phase 7B: Data isolation error handler
function handleDataIsolationError(operation: string): void {
  console.error(`[Data Isolation] ${operation} blocked: No workspace context`)
}

export async function getBuyers(workspaceId?: string | null): Promise<Buyer[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return Promise.resolve([])
  }

  const supabase = createClient()
  let query = supabase
    .from('buyers')
    .select('*')
    .order('created_at', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching buyers:', error)
    return []
  }
  
  return (data || []) as Buyer[]
}

export async function getBuyerById(id: string, workspaceId?: string | null): Promise<Buyer | null> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = createClient()
  let query = supabase
    .from('buyers')
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
  
  return data as Buyer
}

export async function createBuyer(buyer: Buyer, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, buyer not created')
    throw new Error('Supabase not configured')
  }

  // Phase 7B: Require workspace context
  if (!currentWorkspaceId) {
    handleDataIsolationError('createBuyer')
    throw new Error('No workspace context. Cannot create buyer.')
  }

  const supabase = createClient()
  const insertData = {
    id: buyer.id,
    workspace_id: currentWorkspaceId, // Phase 7B: Associate with workspace
    name: buyer.name,
    email: buyer.email,
    phone: buyer.phone,
    status: buyer.status,
    buyer_type: buyer.buyer_type,
    target_areas: buyer.target_areas,
    property_types: buyer.property_types,
    budget_min: buyer.budget_min,
    budget_max: buyer.budget_max,
    min_bedrooms: buyer.min_bedrooms,
    min_area_m2: buyer.min_area_m2,
    timeline: buyer.timeline,
    seriousness: buyer.seriousness,
    pre_approved: buyer.pre_approved,
    cash_buyer: buyer.cash_buyer,
    next_action: buyer.next_action,
    next_action_date: buyer.next_action_date,
    notes: buyer.notes,
    language_preference: buyer.language_preference,
  }
  const { error } = await (supabase as any)
    .from('buyers')
    .insert(insertData)
  
  if (error) {
    console.error('Error creating buyer:', error)
    throw error
  }

  // Auto-generate matches for this buyer in background
  try {
    console.log('[AutoMatch] Generating matches for new buyer:', buyer.id)
    generateMatchesForBuyer(buyer.id).then(result => {
      console.log('[AutoMatch] Generated matches:', result)
    }).catch(err => {
      console.error('[AutoMatch] Failed to generate matches:', err)
    })
  } catch (err) {
    // Non-blocking: match generation failure shouldn't break buyer creation
    console.error('[AutoMatch] Error triggering match generation:', err)
  }
}

export async function updateBuyer(buyer: Buyer, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, buyer not updated')
    throw new Error('Supabase not configured')
  }

  const supabase = createClient()
  const updateData = {
    name: buyer.name,
    email: buyer.email,
    phone: buyer.phone,
    status: buyer.status,
    buyer_type: buyer.buyer_type,
    target_areas: buyer.target_areas,
    property_types: buyer.property_types,
    budget_min: buyer.budget_min,
    budget_max: buyer.budget_max,
    min_bedrooms: buyer.min_bedrooms,
    min_area_m2: buyer.min_area_m2,
    timeline: buyer.timeline,
    seriousness: buyer.seriousness,
    pre_approved: buyer.pre_approved,
    cash_buyer: buyer.cash_buyer,
    next_action: buyer.next_action,
    next_action_date: buyer.next_action_date,
    notes: buyer.notes,
    language_preference: buyer.language_preference,
    updated_at: new Date().toISOString(),
  }
  
  let query = (supabase as any)
    .from('buyers')
    .update(updateData)
    .eq('id', buyer.id)
  
  // Phase 7B: Enforce workspace isolation on update
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { error } = await query
  
  if (error) {
    console.error('Error updating buyer:', error)
    throw error
  }
}

export async function getBuyersByStatus(status: BuyerStatus, workspaceId?: string | null): Promise<Buyer[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('buyers')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching buyers by status:', error)
    return []
  }
  
  return (data || []) as Buyer[]
}

export async function getHighPriorityBuyers(workspaceId?: string | null): Promise<Buyer[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('buyers')
    .select('*')
    .in('seriousness', ['high', 'very_high'])
    .order('created_at', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching high priority buyers:', error)
    return []
  }
  
  return (data || []) as Buyer[]
}
