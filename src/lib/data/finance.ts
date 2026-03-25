import { FinanceProfile, FinanceStatus, DocumentType, DocumentCheck } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

// Helper to create document check
const createDoc = (type: DocumentType, present: boolean, verified: boolean): DocumentCheck => ({
  type,
  present,
  verified,
  uploaded_at: present ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null
})

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

// Phase 7B: Get current workspace ID
function getCurrentWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('workspace_id')
}

export async function getFinanceProfiles(workspaceId?: string | null): Promise<FinanceProfile[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('finance_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching finance profiles:', error)
    return []
  }
  
  // Convert JSON documents back to DocumentCheck array
  return (data as any[]).map(row => ({
    ...row,
    documents: row.documents || [],
  })) as FinanceProfile[]
}

export async function getFinanceProfileById(id: string, workspaceId?: string | null): Promise<FinanceProfile | null> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = createClient()
  let query = supabase
    .from('finance_profiles')
    .select('*')
    .eq('id', id)
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query.single()
  
  if (error || !data) {
    return null
  }
  
  return {
    ...(data as any),
    documents: (data as any).documents || [],
  } as FinanceProfile
}

export async function getFinanceProfileByBuyer(buyerId: string, workspaceId?: string | null): Promise<FinanceProfile | null> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = createClient()
  let query = supabase
    .from('finance_profiles')
    .select('*')
    .eq('buyer_id', buyerId)
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query.single()
  
  if (error || !data) {
    return null
  }
  
  return {
    ...(data as any),
    documents: (data as any).documents || [],
  } as FinanceProfile
}

export async function saveFinanceProfile(profile: FinanceProfile, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, finance profile not saved')
    throw new Error('Supabase not configured')
  }

  const supabase = createClient()
  
  // Check if profile already exists
  let checkQuery = supabase
    .from('finance_profiles')
    .select('id')
    .eq('id', profile.id)
  
  if (currentWorkspaceId) {
    checkQuery = checkQuery.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data: existing } = await checkQuery.single()
  
  if (existing) {
    // Update
    const updateData = {
      status: profile.status,
      documents: profile.documents,
      documents_complete: profile.documents_complete,
      completion_percentage: profile.completion_percentage,
      annual_income: profile.annual_income,
      available_down_payment: profile.available_down_payment,
      existing_debt_monthly: profile.existing_debt_monthly,
      estimated_max_budget: profile.estimated_max_budget,
      estimated_monthly_payment: profile.estimated_monthly_payment,
      affordability_status: profile.affordability_status,
      under_review_since: profile.under_review_since,
      reviewed_by: profile.reviewed_by,
      review_notes: profile.review_notes,
      missing_documents: profile.missing_documents,
      recommended_actions: profile.recommended_actions,
      updated_at: new Date().toISOString(),
    }
    
    let updateQuery = (supabase as any)
      .from('finance_profiles')
      .update(updateData)
      .eq('id', profile.id)
    
    if (currentWorkspaceId) {
      updateQuery = updateQuery.eq('workspace_id', currentWorkspaceId)
    }
    
    const { error } = await updateQuery
    
    if (error) {
      console.error('Error updating finance profile:', error)
      throw error
    }
  } else {
    // Phase 7B: Require workspace context for creation
    if (!currentWorkspaceId) {
      console.error('[Data Isolation] saveFinanceProfile blocked: No workspace context')
      throw new Error('No workspace context. Cannot create finance profile.')
    }
    
    // Insert
    const insertData = {
      id: profile.id,
      workspace_id: currentWorkspaceId, // Phase 7B: Associate with workspace
      buyer_id: profile.buyer_id,
      status: profile.status,
      documents: profile.documents,
      documents_complete: profile.documents_complete,
      completion_percentage: profile.completion_percentage,
      annual_income: profile.annual_income,
      available_down_payment: profile.available_down_payment,
      existing_debt_monthly: profile.existing_debt_monthly,
      estimated_max_budget: profile.estimated_max_budget,
      estimated_monthly_payment: profile.estimated_monthly_payment,
      affordability_status: profile.affordability_status,
      under_review_since: profile.under_review_since,
      reviewed_by: profile.reviewed_by,
      review_notes: profile.review_notes,
      missing_documents: profile.missing_documents,
      recommended_actions: profile.recommended_actions,
    }
    const { error } = await (supabase as any)
      .from('finance_profiles')
      .insert(insertData)
    
    if (error) {
      console.error('Error creating finance profile:', error)
      throw error
    }
  }
}

export async function getFinanceProfilesByStatus(status: FinanceStatus, workspaceId?: string | null): Promise<FinanceProfile[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('finance_profiles')
    .select('*')
    .eq('status', status)
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching finance profiles by status:', error)
    return []
  }
  
  return (data || []).map((row: any) => ({
    ...row,
    documents: row.documents || [],
  })) as FinanceProfile[]
}

export async function getBlockedFinanceProfiles(workspaceId?: string | null): Promise<FinanceProfile[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('finance_profiles')
    .select('*')
    .in('status', ['incomplete', 'needs_clarification'])
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching blocked finance profiles:', error)
    return []
  }
  
  return (data || []).map((row: any) => ({
    ...row,
    documents: row.documents || [],
  })) as FinanceProfile[]
}

export async function getReadyFinanceProfiles(workspaceId?: string | null): Promise<FinanceProfile[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from('finance_profiles')
    .select('*')
    .in('status', ['ready_to_progress', 'strong_buyer'])
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching ready finance profiles:', error)
    return []
  }
  
  return (data || []).map((row: any) => ({
    ...row,
    documents: row.documents || [],
  })) as FinanceProfile[]
}
