import { FinanceProfile, FinanceStatus, DocumentType, DocumentCheck } from '@/types/database'

// Helper to create document check
const createDoc = (type: DocumentType, present: boolean, verified: boolean): DocumentCheck => ({
  type,
  present,
  verified,
  uploaded_at: present ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null
})

// Mock finance profiles for Dealock finance readiness layer
export const mockFinanceProfiles: FinanceProfile[] = [
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

export async function getFinanceProfiles(): Promise<FinanceProfile[]> {
  return mockFinanceProfiles
}

export async function getFinanceProfileById(id: string): Promise<FinanceProfile | null> {
  return mockFinanceProfiles.find(f => f.id === id) || null
}

export async function getFinanceProfileByBuyer(buyerId: string): Promise<FinanceProfile | null> {
  return mockFinanceProfiles.find(f => f.buyer_id === buyerId) || null
}

export async function getFinanceProfilesByStatus(status: FinanceStatus): Promise<FinanceProfile[]> {
  return mockFinanceProfiles.filter(f => f.status === status)
}

export async function getBlockedFinanceProfiles(): Promise<FinanceProfile[]> {
  return mockFinanceProfiles.filter(f => 
    f.status === 'incomplete' || f.status === 'needs_clarification'
  )
}

export async function getReadyFinanceProfiles(): Promise<FinanceProfile[]> {
  return mockFinanceProfiles.filter(f => 
    f.status === 'ready_to_progress' || f.status === 'strong_buyer'
  )
}
