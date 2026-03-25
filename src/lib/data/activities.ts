import { Activity, ActivityType } from '@/types/database'
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

export async function getActivities(workspaceId?: string | null): Promise<Activity[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return Promise.resolve([])
  }

  const supabase = createClient()
  let query = supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }
  
  return (data || []) as Activity[]
}

export async function getActivitiesByLeadId(leadId: string, workspaceId?: string | null): Promise<Activity[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return Promise.resolve([])
  }

  const supabase = createClient()
  let query = supabase
    .from('activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching activities by lead:', error)
    return []
  }
  
  return (data || []) as Activity[]
}

export async function getActivitiesByBuyerId(buyerId: string, workspaceId?: string | null): Promise<Activity[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return Promise.resolve([])
  }

  const supabase = createClient()
  let query = supabase
    .from('activities')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })
  
  // Phase 7B: Enforce workspace filtering
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching activities by buyer:', error)
    return []
  }
  
  return (data || []) as Activity[]
}

export async function addActivity(activity: Omit<Activity, 'id' | 'created_at'>, workspaceId?: string | null): Promise<Activity> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  const newActivity: Activity = {
    ...activity,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, activity not persisted')
    return newActivity
  }

  // Phase 7B: Require workspace context for creation
  if (!currentWorkspaceId) {
    console.error('[Data Isolation] addActivity blocked: No workspace context')
    return newActivity
  }

  const supabase = createClient()
  const insertData = {
    id: newActivity.id,
    workspace_id: currentWorkspaceId, // Phase 7B: Associate with workspace
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
  }
  
  return newActivity
}
