import { Lead, LeadStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { runMatchGeneration } from '@/lib/intelligence/match-service'

// Demo/seed data for initial load
const mockLeads: Lead[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-03-10T08:00:00Z',
    updated_at: '2024-03-20T14:30:00Z',
    workspace_id: null,
    owner_name: 'Marie Dupont',
    email: 'marie.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    whatsapp_status: 'replied',
    source: 'Referral',
    listing_url: 'https://example.com/listing/1',
    property_type: 'Apartment',
    neighborhood: '6th Arrondissement',
    city: 'Lyon',
    price: 450000,
    area_m2: 85,
    bedrooms: 3,
    seller_type: 'owner',
    language_preference: 'fr',
    days_on_market_estimate: 15,
    asking_vs_market_delta: -2.5,
    photos_quality_score: 0.85,
    description_quality_score: 0.75,
    priority_score: 0.92,
    seller_profile: 'Motivated seller, recently renovated kitchen, needs to sell within 60 days for job relocation. Open to exclusivity.',
    status: 'mandate_signed',
    notes: 'Prefers communication via email during business hours. Has all documentation ready.',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    created_at: '2024-03-12T10:00:00Z',
    updated_at: '2024-03-19T16:00:00Z',
    workspace_id: null,
    owner_name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+351 912 345 678',
    whatsapp_status: 'read',
    source: 'Website',
    listing_url: 'https://example.com/listing/2',
    property_type: 'Villa',
    neighborhood: 'Cascais Centre',
    city: 'Cascais',
    price: 320000,
    area_m2: 120,
    bedrooms: 4,
    seller_type: 'owner',
    language_preference: 'pt',
    days_on_market_estimate: 45,
    asking_vs_market_delta: 5.0,
    photos_quality_score: 0.70,
    description_quality_score: 0.60,
    priority_score: 0.78,
    seller_profile: 'Family home, owners moving abroad. Some price flexibility. Interested in quick sale but not desperate.',
    status: 'mandate_proposed',
    notes: 'Responded well to market analysis. Waiting for exclusivity proposal.',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    created_at: '2024-03-14T09:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
    workspace_id: null,
    owner_name: 'Emma Johnson',
    email: 'emma.johnson@email.com',
    phone: '+44 7700 900123',
    whatsapp_status: 'delivered',
    source: 'Social Media',
    listing_url: 'https://example.com/listing/3',
    property_type: 'Studio',
    neighborhood: 'Le Marais',
    city: 'Paris',
    price: 280000,
    area_m2: 28,
    bedrooms: 0,
    seller_type: 'investor',
    language_preference: 'en',
    days_on_market_estimate: 8,
    asking_vs_market_delta: -8.0,
    photos_quality_score: 0.90,
    description_quality_score: 0.80,
    priority_score: 0.85,
    seller_profile: 'Investor selling after renovation. Price expectations realistic. Professional and responsive.',
    status: 'call_scheduled',
    notes: 'Call scheduled for tomorrow 10 AM. Wants to discuss pricing strategy.',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    created_at: '2024-03-08T14:00:00Z',
    updated_at: '2024-03-18T10:00:00Z',
    workspace_id: null,
    owner_name: 'Carlos Mendes',
    email: 'carlos.mendes@email.com',
    phone: '+351 923 456 789',
    whatsapp_status: 'sent',
    source: 'Email Campaign',
    listing_url: 'https://example.com/listing/4',
    property_type: 'Apartment',
    neighborhood: 'Chiado',
    city: 'Lisbon',
    price: 390000,
    area_m2: 65,
    bedrooms: 2,
    seller_type: 'developer',
    language_preference: 'pt',
    days_on_market_estimate: 120,
    asking_vs_market_delta: 12.0,
    photos_quality_score: 0.55,
    description_quality_score: 0.45,
    priority_score: 0.62,
    seller_profile: 'Developer with multiple units. Price is above market. Slow to respond. Low priority.',
    status: 'replied',
    notes: 'Sent initial message. Auto-reply indicates out of office until next week.',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    created_at: '2024-03-16T11:00:00Z',
    updated_at: '2024-03-20T09:00:00Z',
    workspace_id: null,
    owner_name: 'Sophie Martin',
    email: 'sophie.martin@email.com',
    phone: '+33 6 98 76 54 32',
    whatsapp_status: 'not_sent',
    source: 'Referral',
    listing_url: 'https://example.com/listing/5',
    property_type: 'House',
    neighborhood: 'Chartrons',
    city: 'Bordeaux',
    price: 510000,
    area_m2: 140,
    bedrooms: 4,
    seller_type: 'owner',
    language_preference: 'fr',
    days_on_market_estimate: 30,
    asking_vs_market_delta: 0.0,
    photos_quality_score: 0.80,
    description_quality_score: 0.85,
    priority_score: 0.88,
    seller_profile: 'High-value property, motivated seller, divorce situation. Needs discretion and speed.',
    status: 'qualified',
    notes: 'Referral from previous client. Very motivated, needs to sell within 90 days.',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    created_at: '2024-03-15T13:00:00Z',
    updated_at: '2024-03-19T15:00:00Z',
    workspace_id: null,
    owner_name: 'Lucas Pereira',
    email: 'lucas.pereira@email.com',
    phone: '+351 934 567 890',
    whatsapp_status: 'replied',
    source: 'Website',
    listing_url: 'https://example.com/listing/6',
    property_type: 'Apartment',
    neighborhood: 'Alcântara',
    city: 'Lisbon',
    price: 245000,
    area_m2: 55,
    bedrooms: 1,
    seller_type: 'owner',
    language_preference: 'pt',
    days_on_market_estimate: 22,
    asking_vs_market_delta: -3.0,
    photos_quality_score: 0.75,
    description_quality_score: 0.70,
    priority_score: 0.82,
    seller_profile: 'First-time seller, needs guidance through process. Responsive and friendly.',
    status: 'contacted',
    notes: 'Initial contact made. Interested in learning about market conditions.',
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    created_at: '2024-03-20T08:00:00Z',
    updated_at: '2024-03-20T08:00:00Z',
    workspace_id: null,
    owner_name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '+351 945 678 901',
    whatsapp_status: 'not_sent',
    source: 'Walk-in',
    listing_url: null,
    property_type: 'Villa',
    neighborhood: 'Estoril',
    city: 'Cascais',
    price: 580000,
    area_m2: 200,
    bedrooms: 5,
    seller_type: 'owner',
    language_preference: 'pt',
    days_on_market_estimate: 5,
    asking_vs_market_delta: -5.0,
    photos_quality_score: 0.88,
    description_quality_score: 0.60,
    priority_score: 0.90,
    seller_profile: 'Luxury property, high expectations. Wants premium service and marketing.',
    status: 'new',
    notes: 'Just added to system. Needs initial assessment and contact.',
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    workspace_id: null,
    owner_name: 'Pedro Santos',
    email: 'pedro.santos@email.com',
    phone: '+351 956 789 012',
    whatsapp_status: 'read',
    source: 'Portal',
    listing_url: 'https://example.com/listing/8',
    property_type: 'Apartment',
    neighborhood: 'Campo de Ourique',
    city: 'Lisbon',
    price: 420000,
    area_m2: 75,
    bedrooms: 2,
    seller_type: 'investor',
    language_preference: 'pt',
    days_on_market_estimate: 60,
    asking_vs_market_delta: 8.0,
    photos_quality_score: 0.65,
    description_quality_score: 0.55,
    priority_score: 0.45,
    seller_profile: 'Price too high, not flexible. Multiple agents already contacted.',
    status: 'lost',
    notes: 'Decided to go with another agency. May re-engage in future.',
  },
]

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

// Phase 7: Get current workspace ID from localStorage
function getCurrentWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('workspace_id')
}

// Data service functions with workspace scoping (Phase 7)
export async function getLeads(workspaceId?: string | null): Promise<Lead[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    return Promise.resolve([...mockLeads])
  }

  const supabase = createClient()
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  
  // Phase 7: Filter by workspace if available
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching leads:', error)
    return [...mockLeads]
  }
  
  // If no data in Supabase yet, return mock data
  if (!data || data.length === 0) {
    return [...mockLeads]
  }
  
  return data as Lead[]
}

export async function getLeadById(id: string, workspaceId?: string | null): Promise<Lead | null> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    const lead = mockLeads.find(l => l.id === id)
    return Promise.resolve(lead || null)
  }

  const supabase = createClient()
  let query = supabase
    .from('leads')
    .select('*')
    .eq('id', id)
  
  // Phase 7: Filter by workspace if available
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query.single()
  
  if (error) {
    // If not found in Supabase, check mock data
    const mockLead = mockLeads.find(l => l.id === id)
    return mockLead || null
  }
  
  return data as Lead
}

export async function createLead(lead: Lead, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, lead created in memory only')
    return Promise.resolve()
  }

  const supabase = createClient()
  const insertData = {
    id: lead.id,
    workspace_id: currentWorkspaceId, // Phase 7: Associate with workspace
    owner_name: lead.owner_name,
    email: lead.email,
    phone: lead.phone,
    whatsapp_status: lead.whatsapp_status,
    source: lead.source,
    listing_url: lead.listing_url,
    property_type: lead.property_type,
    neighborhood: lead.neighborhood,
    city: lead.city,
    price: lead.price,
    area_m2: lead.area_m2,
    bedrooms: lead.bedrooms,
    seller_type: lead.seller_type,
    language_preference: lead.language_preference,
    days_on_market_estimate: lead.days_on_market_estimate,
    asking_vs_market_delta: lead.asking_vs_market_delta,
    photos_quality_score: lead.photos_quality_score,
    description_quality_score: lead.description_quality_score,
    priority_score: lead.priority_score,
    seller_profile: lead.seller_profile,
    status: lead.status,
    notes: lead.notes,
  }
  const { error } = await (supabase as any)
    .from('leads')
    .insert(insertData)
  
  if (error) {
    console.error('Error creating lead:', error)
    throw error
  }

  // Auto-generate matches for all buyers against this new seller in background
  try {
    console.log('[AutoMatch] Generating matches for new seller:', lead.id)
    runMatchGeneration().then(result => {
      console.log('[AutoMatch] Generated matches for new seller:', result)
    }).catch(err => {
      console.error('[AutoMatch] Failed to generate matches for seller:', err)
    })
  } catch (err) {
    // Non-blocking: match generation failure shouldn't break lead creation
    console.error('[AutoMatch] Error triggering match generation:', err)
  }
}

export async function updateLead(lead: Lead, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, lead updated in memory only')
    return Promise.resolve()
  }

  const supabase = createClient()
  const updateData = {
    owner_name: lead.owner_name,
    email: lead.email,
    phone: lead.phone,
    whatsapp_status: lead.whatsapp_status,
    source: lead.source,
    listing_url: lead.listing_url,
    property_type: lead.property_type,
    neighborhood: lead.neighborhood,
    city: lead.city,
    price: lead.price,
    area_m2: lead.area_m2,
    bedrooms: lead.bedrooms,
    seller_type: lead.seller_type,
    language_preference: lead.language_preference,
    days_on_market_estimate: lead.days_on_market_estimate,
    asking_vs_market_delta: lead.asking_vs_market_delta,
    photos_quality_score: lead.photos_quality_score,
      description_quality_score: lead.description_quality_score,
    priority_score: lead.priority_score,
    seller_profile: lead.seller_profile,
    status: lead.status,
    notes: lead.notes,
    updated_at: new Date().toISOString(),
  }
  
  let query = (supabase as any)
    .from('leads')
    .update(updateData)
    .eq('id', lead.id)
  
  // Phase 7: Ensure workspace isolation on update
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { error } = await query
  
  if (error) {
    console.error('Error updating lead:', error)
    throw error
  }
}

export async function getLeadsByStatus(status: LeadStatus, workspaceId?: string | null): Promise<Lead[]> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    const leads = mockLeads.filter(l => l.status === status)
    return Promise.resolve([...leads])
  }

  const supabase = createClient()
  let query = supabase
    .from('leads')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  // Phase 7: Filter by workspace if available
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching leads by status:', error)
    return mockLeads.filter(l => l.status === status)
  }
  
  return (data || []) as Lead[]
}

export async function updateLeadStatus(id: string, status: LeadStatus, workspaceId?: string | null): Promise<void> {
  const currentWorkspaceId = workspaceId || getCurrentWorkspaceId()
  
  if (!isSupabaseConfigured()) {
    const lead = mockLeads.find(l => l.id === id)
    if (lead) {
      lead.status = status
      lead.updated_at = new Date().toISOString()
    }
    return Promise.resolve()
  }

  const supabase = createClient()
  
  let query = (supabase as any)
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  // Phase 7: Ensure workspace isolation
  if (currentWorkspaceId) {
    query = query.eq('workspace_id', currentWorkspaceId)
  }
  
  const { error } = await query
  
  if (error) {
    console.error('Error updating lead status:', error)
    throw error
  }
}
