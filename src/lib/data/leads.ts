import { Lead, LeadStatus } from '@/types/database'

// PHASE 2: Using typed mock data
// TODO: Switch to Supabase when ready by uncommenting the createClient import
// import { createClient } from '@/lib/supabase/client'

// Demo/seed data matching the Supabase schema
const mockLeads: Lead[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-03-10T08:00:00Z',
    updated_at: '2024-03-20T14:30:00Z',
    owner_name: 'Marie Dupont',
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
    owner_name: 'João Silva',
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
    owner_name: 'Emma Johnson',
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
    owner_name: 'Carlos Mendes',
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
    owner_name: 'Sophie Martin',
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
    owner_name: 'Lucas Pereira',
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
    owner_name: 'Ana Costa',
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
    owner_name: 'Pedro Santos',
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

// Data service functions
export async function getLeads(): Promise<Lead[]> {
  // TODO: Replace with Supabase when ready:
  // const supabase = createClient()
  // const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
  // if (error) throw error
  // return data || []
  
  return Promise.resolve([...mockLeads])
}

export async function getLeadById(id: string): Promise<Lead | null> {
  // TODO: Replace with Supabase when ready:
  // const supabase = createClient()
  // const { data, error } = await supabase.from('leads').select('*').eq('id', id).single()
  // if (error) throw error
  // return data
  
  const lead = mockLeads.find(l => l.id === id)
  return Promise.resolve(lead || null)
}

export async function getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
  const leads = mockLeads.filter(l => l.status === status)
  return Promise.resolve([...leads])
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  // TODO: Replace with Supabase when ready
  const lead = mockLeads.find(l => l.id === id)
  if (lead) {
    lead.status = status
    lead.updated_at = new Date().toISOString()
  }
  return Promise.resolve()
}
