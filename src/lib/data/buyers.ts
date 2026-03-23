import { Buyer, BuyerStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

// Mock buyers data for Dealock buyer qualification layer
const mockBuyers: Buyer[] = [
  {
    id: 'buyer-1',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-03-18T14:20:00Z',
    name: 'Marc Dubois',
    email: 'marc.dubois@email.com',
    phone: '+33 6 12 34 56 78',
    status: 'qualified',
    buyer_type: 'investor',
    target_areas: ['Marais', 'Saint-Germain', 'Montmartre'],
    property_types: ['Apartment', 'Loft'],
    budget_min: 800000,
    budget_max: 1200000,
    min_bedrooms: 2,
    min_area_m2: 60,
    timeline: '1_month',
    seriousness: 'very_high',
    pre_approved: true,
    cash_buyer: false,
    next_action: 'Schedule viewing for Le Marais penthouse',
    next_action_date: '2026-03-21T10:00:00Z',
    notes: 'Serious investor, looking for rental yield. Has viewed 3 properties already.',
    language_preference: 'fr',
  },
  {
    id: 'buyer-2',
    created_at: '2026-02-03T09:15:00Z',
    updated_at: '2026-03-19T11:30:00Z',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    phone: '+33 7 23 45 67 89',
    status: 'viewing_scheduled',
    buyer_type: 'relocating',
    target_areas: ['La Défense', 'Neuilly-sur-Seine'],
    property_types: ['Apartment', 'House'],
    budget_min: 600000,
    budget_max: 900000,
    min_bedrooms: 2,
    min_area_m2: 70,
    timeline: 'immediate',
    seriousness: 'high',
    pre_approved: true,
    cash_buyer: false,
    next_action: 'Confirm viewing for Neuilly property',
    next_action_date: '2026-03-22T14:00:00Z',
    notes: 'Relocating from Singapore. Company covering relocation costs. Needs to decide by April.',
    language_preference: 'en',
  },
  {
    id: 'buyer-3',
    created_at: '2026-02-20T16:45:00Z',
    updated_at: '2026-03-17T09:00:00Z',
    name: 'Antonio Silva',
    email: 'antonio.silva@email.pt',
    phone: '+351 9 12 34 56 78',
    status: 'new',
    buyer_type: 'first_time',
    target_areas: ['Lisbon - Príncipe Real', 'Lisbon - Campo de Ourique'],
    property_types: ['Apartment'],
    budget_min: 350000,
    budget_max: 500000,
    min_bedrooms: 1,
    min_area_m2: 50,
    timeline: '3_months',
    seriousness: 'medium',
    pre_approved: false,
    cash_buyer: false,
    next_action: 'Send pre-approval guidance',
    next_action_date: '2026-03-20T10:00:00Z',
    notes: 'First-time buyer from Porto. Needs guidance on financing options.',
    language_preference: 'pt',
  },
  {
    id: 'buyer-4',
    created_at: '2026-01-28T11:20:00Z',
    updated_at: '2026-03-19T16:15:00Z',
    name: 'Emma & James Wilson',
    email: 'wilson.family@email.com',
    phone: '+44 7 98 76 54 32',
    status: 'offer_pending',
    buyer_type: 'upgrading',
    target_areas: ['7th Arrondissement', '15th Arrondissement'],
    property_types: ['Apartment'],
    budget_min: 1000000,
    budget_max: 1500000,
    min_bedrooms: 3,
    min_area_m2: 100,
    timeline: '1_month',
    seriousness: 'very_high',
    pre_approved: true,
    cash_buyer: true,
    next_action: 'Present counter-offer',
    next_action_date: '2026-03-20T09:00:00Z',
    notes: 'Cash buyers. Current offer 1.2M on 15th arrondissement property.',
    language_preference: 'en',
  },
  {
    id: 'buyer-5',
    created_at: '2026-03-05T14:30:00Z',
    updated_at: '2026-03-18T10:45:00Z',
    name: 'Pierre Martin',
    email: 'p.martin@email.fr',
    phone: '+33 6 98 76 54 32',
    status: 'contacted',
    buyer_type: 'downsizing',
    target_areas: ['Boulogne-Billancourt', 'Issy-les-Moulineaux'],
    property_types: ['Apartment'],
    budget_min: 500000,
    budget_max: 700000,
    min_bedrooms: 2,
    min_area_m2: 55,
    timeline: '3_months',
    seriousness: 'medium',
    pre_approved: false,
    cash_buyer: false,
    next_action: 'Follow up on financing status',
    next_action_date: '2026-03-23T11:00:00Z',
    notes: 'Selling family home in Versailles. Downsizing for retirement.',
    language_preference: 'fr',
  },
  {
    id: 'buyer-6',
    created_at: '2026-02-10T13:00:00Z',
    updated_at: '2026-03-19T15:30:00Z',
    name: 'Isabella Santos',
    email: 'isabella.santos@email.com',
    phone: '+34 6 12 34 56 78',
    status: 'qualified',
    buyer_type: 'investor',
    target_areas: ['Barcelona - Eixample', 'Barcelona - Gràcia'],
    property_types: ['Apartment', 'Commercial'],
    budget_min: 400000,
    budget_max: 650000,
    min_bedrooms: 1,
    min_area_m2: 45,
    timeline: 'immediate',
    seriousness: 'high',
    pre_approved: true,
    cash_buyer: true,
    next_action: 'Present Eixample opportunity',
    next_action_date: '2026-03-21T16:00:00Z',
    notes: 'Spanish investor looking for short-term rental opportunities.',
    language_preference: 'es',
  },
  {
    id: 'buyer-7',
    created_at: '2026-03-10T09:45:00Z',
    updated_at: '2026-03-19T12:00:00Z',
    name: 'Thomas Mueller',
    email: 't.mueller@email.de',
    phone: '+49 17 12 34 56 78',
    status: 'new',
    buyer_type: 'relocating',
    target_areas: ['Mitte', 'Prenzlauer Berg', 'Kreuzberg'],
    property_types: ['Apartment'],
    budget_min: 450000,
    budget_max: 600000,
    min_bedrooms: 2,
    min_area_m2: 60,
    timeline: '3_months',
    seriousness: 'low',
    pre_approved: false,
    cash_buyer: false,
    next_action: 'Send market overview',
    next_action_date: '2026-03-25T10:00:00Z',
    notes: 'Early stage, just exploring Berlin market. Not urgent.',
    language_preference: 'en',
  },
]

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

export async function getBuyers(): Promise<Buyer[]> {
  if (!isSupabaseConfigured()) {
    return [...mockBuyers]
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('buyers')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching buyers:', error)
    return [...mockBuyers]
  }
  
  // If no data in Supabase yet, return mock data
  if (!data || data.length === 0) {
    return [...mockBuyers]
  }
  
  return data as Buyer[]
}

export async function getBuyerById(id: string): Promise<Buyer | null> {
  if (!isSupabaseConfigured()) {
    return mockBuyers.find(b => b.id === id) || null
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('buyers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    // If not found in Supabase, check mock data
    return mockBuyers.find(b => b.id === id) || null
  }
  
  return data as Buyer
}

export async function createBuyer(buyer: Buyer): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, buyer created in memory only')
    return Promise.resolve()
  }

  const supabase = createClient()
  const insertData = {
    id: buyer.id,
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
}

export async function updateBuyer(buyer: Buyer): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, buyer updated in memory only')
    return Promise.resolve()
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
  const { error } = await (supabase as any)
    .from('buyers')
    .update(updateData)
    .eq('id', buyer.id)
  
  if (error) {
    console.error('Error updating buyer:', error)
    throw error
  }
}

export async function getBuyersByStatus(status: BuyerStatus): Promise<Buyer[]> {
  if (!isSupabaseConfigured()) {
    return mockBuyers.filter(b => b.status === status)
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('buyers')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching buyers by status:', error)
    return mockBuyers.filter(b => b.status === status)
  }
  
  return (data || []) as Buyer[]
}

export async function getHighPriorityBuyers(): Promise<Buyer[]> {
  if (!isSupabaseConfigured()) {
    return mockBuyers.filter(b => 
      b.seriousness === 'high' || b.seriousness === 'very_high'
    )
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('buyers')
    .select('*')
    .in('seriousness', ['high', 'very_high'])
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching high priority buyers:', error)
    return mockBuyers.filter(b => 
      b.seriousness === 'high' || b.seriousness === 'very_high'
    )
  }
  
  return (data || []) as Buyer[]
}
