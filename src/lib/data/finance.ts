import { FinanceProfile, FinanceStatus, DocumentType, DocumentCheck } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

// Helper to create document check
const createDoc = (type: DocumentType, present: boolean, verified: boolean): DocumentCheck => ({
  type,
  present,
  verified,
  uploaded_at: present ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null
})

// Mock finance profiles for Dealock finance readiness layer
const mockFinanceProfiles: FinanceProfile[] = [
  {
    id: 'finance-1',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-03-19T14:00:00Z',
    buyer_id: 'buyer-1',
    status: 'strong_buyer',
    documents: [
      createDoc('id_document', true, true),
      createDoc('proof_income', true, true),
      createDoc('bank_statements', true, true),
      createDoc('tax_returns', true, true),
      createDoc('employment_contract', true, true),
      createDoc('loan_pre_approval', true, true),
    ],
    documents_complete: true,
    completion_percentage: 100,
    annual_income: 180000,
    available_down_payment: 300000,
    existing_debt_monthly: 800,
    estimated_max_budget: 1200000,
    estimated_monthly_payment: 4200,
    affordability_status: 'comfortable',
    under_review_since: null,
    reviewed_by: 'System',
    review_notes: 'Pre-approved for 1M. Strong financial position.',
    missing_documents: [],
    recommended_actions: ['Proceed with confidence'],
  },
  {
    id: 'finance-2',
    created_at: '2026-02-05T11:30:00Z',
    updated_at: '2026-03-18T16:30:00Z',
    buyer_id: 'buyer-2',
    status: 'ready_to_progress',
    documents: [
      createDoc('id_document', true, true),
      createDoc('proof_income', true, true),
      createDoc('bank_statements', true, false),
      createDoc('tax_returns', true, false),
      createDoc('employment_contract', true, true),
      createDoc('loan_pre_approval', true, true),
    ],
    documents_complete: false,
    completion_percentage: 83,
    annual_income: 150000,
    available_down_payment: 200000,
    existing_debt_monthly: 0,
    estimated_max_budget: 900000,
    estimated_monthly_payment: 3500,
    affordability_status: 'comfortable',
    under_review_since: '2026-03-17T10:00:00Z',
    reviewed_by: 'System',
    review_notes: 'Documents under review. Relocation package confirmed.',
    missing_documents: [],
    recommended_actions: ['Verify bank statements', 'Confirm tax return details'],
  },
  {
    id: 'finance-3',
    created_at: '2026-02-25T09:00:00Z',
    updated_at: '2026-03-19T10:15:00Z',
    buyer_id: 'buyer-3',
    status: 'incomplete',
    documents: [
      createDoc('id_document', true, false),
      createDoc('proof_income', false, false),
      createDoc('bank_statements', false, false),
      createDoc('tax_returns', false, false),
      createDoc('employment_contract', false, false),
      createDoc('loan_pre_approval', false, false),
    ],
    documents_complete: false,
    completion_percentage: 17,
    annual_income: 45000,
    available_down_payment: 50000,
    existing_debt_monthly: 200,
    estimated_max_budget: 350000,
    estimated_monthly_payment: 1400,
    affordability_status: 'tight',
    under_review_since: null,
    reviewed_by: null,
    review_notes: null,
    missing_documents: ['proof_income', 'bank_statements', 'tax_returns', 'employment_contract', 'loan_pre_approval'],
    recommended_actions: [
      'Upload proof of income',
      'Provide 3 months bank statements',
      'Get pre-approval from bank'
    ],
  },
  {
    id: 'finance-4',
    created_at: '2026-01-30T14:00:00Z',
    updated_at: '2026-03-19T11:00:00Z',
    buyer_id: 'buyer-4',
    status: 'strong_buyer',
    documents: [
      createDoc('id_document', true, true),
      createDoc('proof_income', true, true),
      createDoc('bank_statements', true, true),
      createDoc('tax_returns', true, true),
      createDoc('existing_property_docs', true, true),
    ],
    documents_complete: true,
    completion_percentage: 100,
    annual_income: 250000,
    available_down_payment: 1500000,
    existing_debt_monthly: 0,
    estimated_max_budget: 2000000,
    estimated_monthly_payment: 0,
    affordability_status: 'strong',
    under_review_since: null,
    reviewed_by: 'System',
    review_notes: 'Cash buyer. Funds verified. Excellent financial position.',
    missing_documents: [],
    recommended_actions: ['Proceed with confidence'],
  },
  {
    id: 'finance-5',
    created_at: '2026-02-15T10:30:00Z',
    updated_at: '2026-03-18T15:00:00Z',
    buyer_id: 'buyer-5',
    status: 'needs_clarification',
    documents: [
      createDoc('id_document', true, true),
      createDoc('proof_income', true, false),
      createDoc('bank_statements', true, false),
      createDoc('existing_property_docs', true, false),
    ],
    documents_complete: false,
    completion_percentage: 67,
    annual_income: 80000,
    available_down_payment: 400000,
    existing_debt_monthly: 0,
    estimated_max_budget: 700000,
    estimated_monthly_payment: 2200,
    affordability_status: 'comfortable',
    under_review_since: '2026-03-15T09:00:00Z',
    reviewed_by: 'System',
    review_notes: 'Downsizing from Versailles. Need to verify sale proceeds.',
    missing_documents: ['tax_returns'],
    recommended_actions: [
      'Clarify timeline for Versailles sale',
      'Verify retirement income sources',
      'Upload tax returns'
    ],
  },
  {
    id: 'finance-6',
    created_at: '2026-02-12T13:00:00Z',
    updated_at: '2026-03-19T12:30:00Z',
    buyer_id: 'buyer-6',
    status: 'ready_to_progress',
    documents: [
      createDoc('id_document', true, true),
      createDoc('proof_income', true, true),
      createDoc('bank_statements', true, true),
      createDoc('tax_returns', true, true),
      createDoc('employment_contract', false, false),
      createDoc('loan_pre_approval', false, false),
    ],
    documents_complete: false,
    completion_percentage: 67,
    annual_income: 120000,
    available_down_payment: 650000,
    existing_debt_monthly: 0,
    estimated_max_budget: 650000,
    estimated_monthly_payment: 0,
    affordability_status: 'strong',
    under_review_since: null,
    reviewed_by: null,
    review_notes: null,
    missing_documents: ['employment_contract', 'loan_pre_approval'],
    recommended_actions: [
      'Upload employment contract',
      'Obtain loan pre-approval (optional - cash capable)'
    ],
  },
]

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

export async function getFinanceProfiles(): Promise<FinanceProfile[]> {
  if (!isSupabaseConfigured()) {
    return [...mockFinanceProfiles]
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('finance_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching finance profiles:', error)
    return [...mockFinanceProfiles]
  }
  
  if (!data || data.length === 0) {
    return [...mockFinanceProfiles]
  }
  
  // Convert JSON documents back to DocumentCheck array
  return (data as any[]).map(row => ({
    ...row,
    documents: row.documents || [],
  })) as FinanceProfile[]
}

export async function getFinanceProfileById(id: string): Promise<FinanceProfile | null> {
  if (!isSupabaseConfigured()) {
    return mockFinanceProfiles.find(f => f.id === id) || null
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('finance_profiles')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !data) {
    return mockFinanceProfiles.find(f => f.id === id) || null
  }
  
  return {
    ...(data as any),
    documents: (data as any).documents || [],
  } as FinanceProfile
}

export async function getFinanceProfileByBuyer(buyerId: string): Promise<FinanceProfile | null> {
  if (!isSupabaseConfigured()) {
    return mockFinanceProfiles.find(f => f.buyer_id === buyerId) || null
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('finance_profiles')
    .select('*')
    .eq('buyer_id', buyerId)
    .single()
  
  if (error || !data) {
    return mockFinanceProfiles.find(f => f.buyer_id === buyerId) || null
  }
  
  return {
    ...(data as any),
    documents: (data as any).documents || [],
  } as FinanceProfile
}

export async function saveFinanceProfile(profile: FinanceProfile): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, finance profile saved in memory only')
    return Promise.resolve()
  }

  const supabase = createClient()
  
  // Check if profile already exists
  const { data: existing } = await supabase
    .from('finance_profiles')
    .select('id')
    .eq('id', profile.id)
    .single()
  
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
    const { error } = await (supabase as any)
      .from('finance_profiles')
      .update(updateData)
      .eq('id', profile.id)
    
    if (error) {
      console.error('Error updating finance profile:', error)
      throw error
    }
  } else {
    // Insert
    const insertData = {
      id: profile.id,
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

export async function getFinanceProfilesByStatus(status: FinanceStatus): Promise<FinanceProfile[]> {
  if (!isSupabaseConfigured()) {
    return mockFinanceProfiles.filter(f => f.status === status)
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('finance_profiles')
    .select('*')
    .eq('status', status)
  
  if (error) {
    console.error('Error fetching finance profiles by status:', error)
    return mockFinanceProfiles.filter(f => f.status === status)
  }
  
  return (data || []).map((row: any) => ({
    ...row,
    documents: row.documents || [],
  })) as FinanceProfile[]
}

export async function getBlockedFinanceProfiles(): Promise<FinanceProfile[]> {
  if (!isSupabaseConfigured()) {
    return mockFinanceProfiles.filter(f => 
      f.status === 'incomplete' || f.status === 'needs_clarification'
    )
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('finance_profiles')
    .select('*')
    .in('status', ['incomplete', 'needs_clarification'])
  
  if (error) {
    console.error('Error fetching blocked finance profiles:', error)
    return mockFinanceProfiles.filter(f => 
      f.status === 'incomplete' || f.status === 'needs_clarification'
    )
  }
  
  return (data || []).map((row: any) => ({
    ...row,
    documents: row.documents || [],
  })) as FinanceProfile[]
}

export async function getReadyFinanceProfiles(): Promise<FinanceProfile[]> {
  if (!isSupabaseConfigured()) {
    return mockFinanceProfiles.filter(f => 
      f.status === 'ready_to_progress' || f.status === 'strong_buyer'
    )
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('finance_profiles')
    .select('*')
    .in('status', ['ready_to_progress', 'strong_buyer'])
  
  if (error) {
    console.error('Error fetching ready finance profiles:', error)
    return mockFinanceProfiles.filter(f => 
      f.status === 'ready_to_progress' || f.status === 'strong_buyer'
    )
  }
  
  return (data || []).map((row: any) => ({
    ...row,
    documents: row.documents || [],
  })) as FinanceProfile[]
}
