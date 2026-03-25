import { MatchOpportunity, MatchStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

// Phase 7B: Get current workspace ID
function getCurrentWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('workspace_id')
}

export async function getMatches(workspaceId?: string | null): Promise<MatchOpportunity[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return Promise.resolve([])
  }

  const supabase = createClient()
  let query = supabase
    .from('match_opportunities')
    .select('*')
    .order('score_value', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching matches:', error)
    return []
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchById(id: string, workspaceId?: string | null): Promise<MatchOpportunity | null> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = createClient()
  let query = supabase
    .from('match_opportunities')
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

  return data as MatchOpportunity
}

export async function getHighPriorityMatches(workspaceId?: string | null): Promise<MatchOpportunity[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('match_opportunities')
    .select('*')
    .in('priority', ['high', 'urgent'])
    .order('score_value', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching high priority matches:', error)
    return []
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchesByStatus(status: MatchStatus, workspaceId?: string | null): Promise<MatchOpportunity[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('match_opportunities')
    .select('*')
    .eq('status', status)
    .order('score_value', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching matches by status:', error)
    return []
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchesByBuyer(buyerId: string, workspaceId?: string | null): Promise<MatchOpportunity[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('match_opportunities')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('score_value', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching matches by buyer:', error)
    return []
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchesBySeller(sellerId: string, workspaceId?: string | null): Promise<MatchOpportunity[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('match_opportunities')
    .select('*')
    .eq('target_type', 'seller')
    .eq('target_id', sellerId)
    .order('score_value', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching matches by seller:', error)
    return []
  }

  return (data || []) as MatchOpportunity[]
}

export async function getMatchesByMandate(mandateId: string, workspaceId?: string | null): Promise<MatchOpportunity[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('match_opportunities')
    .select('*')
    .eq('target_type', 'mandate')
    .eq('target_id', mandateId)
    .order('score_value', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching matches by mandate:', error)
    return []
  }

  return (data || []) as MatchOpportunity[]
}

export async function createMatch(match: MatchOpportunity, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, match not created')
    throw new Error('Supabase not configured')
  }

  // Phase 7B: Require workspace context
  if (!currentWorkspaceId) {
    console.error('[Data Isolation] createMatch blocked: No workspace context')
    throw new Error('No workspace context. Cannot create match.')
  }

  const supabase = createClient()
  const insertData = {
    id: match.id,
    workspace_id: currentWorkspaceId, // Phase 7B: Associate with workspace
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

export async function updateMatch(match: MatchOpportunity, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, match not updated')
    throw new Error('Supabase not configured')
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

  let query = (supabase as any)
    .from('match_opportunities')
    .update(updateData)
    .eq('id', match.id)
  
  // Phase 7B: Enforce workspace isolation
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { error } = await query

  if (error) {
    console.error('Error updating match:', error)
    throw error
  }
}

export async function deleteMatch(id: string, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return
  }

  const supabase = createClient()
  
  let query = supabase
    .from('match_opportunities')
    .delete()
    .eq('id', id)
  
  // Phase 7B: Enforce workspace isolation
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }

  const { error } = await query

  if (error) {
    console.error('Error deleting match:', error)
    throw error
  }
}
