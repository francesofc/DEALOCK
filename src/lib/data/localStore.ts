/**
 * Local Storage Record Repository
 * 
 * Provides a unified persistence layer for records until backend is connected.
 * Mock data serves as the base, localStorage provides the override/append layer.
 * 
 * Architecture:
 * - Reads merge mock data + localStorage (localStorage wins for updates)
 * - Writes save to localStorage only (never mutate mock data)
 * - Both list and detail pages use the same merged source
 */

import { Lead, Buyer, FinanceProfile } from '@/types/database'

// Storage keys
const STORAGE_KEYS = {
  leads: 'dealock_leads',
  buyers: 'dealock_buyers',
  finance: 'dealock_finance',
} as const

// Generic store operations
function getStoredRecords<T extends { id: string }>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return {}
    const records: T[] = JSON.parse(stored)
    return records.reduce((acc, record) => {
      acc[record.id] = record
      return acc
    }, {} as Record<string, T>)
  } catch {
    return {}
  }
}

function setStoredRecords<T>(key: string, records: Record<string, T>): void {
  if (typeof window === 'undefined') return
  try {
    const array = Object.values(records)
    localStorage.setItem(key, JSON.stringify(array))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

// Helper to merge mock data with stored records
function mergeWithStorage<T extends { id: string }>(
  mockData: T[],
  storageKey: string
): T[] {
  const stored = getStoredRecords<T>(storageKey)
  
  // Create map of mock records
  const mockMap = mockData.reduce((acc, record) => {
    acc[record.id] = record
    return acc
  }, {} as Record<string, T>)
  
  // Merge: stored records override mock, stored-only records are added
  const merged = { ...mockMap, ...stored }
  
  return Object.values(merged)
}

// Get single record by ID (checks storage first, then mock)
function getById<T extends { id: string }>(
  id: string,
  mockData: T[],
  storageKey: string
): T | null {
  const stored = getStoredRecords<T>(storageKey)
  
  // Storage takes precedence
  if (stored[id]) {
    return stored[id]
  }
  
  // Fall back to mock data
  return mockData.find(r => r.id === id) || null
}

// Save record to storage (creates or updates)
function saveRecord<T extends { id: string }>(
  record: T,
  storageKey: string
): void {
  const stored = getStoredRecords<T>(storageKey)
  stored[record.id] = record
  setStoredRecords(storageKey, stored)
}

// Delete record from storage
function deleteRecord<T extends { id: string }>(
  id: string,
  storageKey: string
): void {
  const stored = getStoredRecords<T>(storageKey)
  delete stored[id]
  setStoredRecords(storageKey, stored)
}

// ============================================
// LEADS / SELLERS
// ============================================

export function getLocalLeads(mockLeads: Lead[]): Lead[] {
  return mergeWithStorage(mockLeads, STORAGE_KEYS.leads)
}

export function getLocalLeadById(id: string, mockLeads: Lead[]): Lead | null {
  return getById(id, mockLeads, STORAGE_KEYS.leads)
}

export function saveLocalLead(lead: Lead): void {
  saveRecord(lead, STORAGE_KEYS.leads)
}

export function deleteLocalLead(id: string): void {
  deleteRecord<Lead>(id, STORAGE_KEYS.leads)
}

// ============================================
// BUYERS
// ============================================

export function getLocalBuyers(mockBuyers: Buyer[]): Buyer[] {
  return mergeWithStorage(mockBuyers, STORAGE_KEYS.buyers)
}

export function getLocalBuyerById(id: string, mockBuyers: Buyer[]): Buyer | null {
  return getById(id, mockBuyers, STORAGE_KEYS.buyers)
}

export function saveLocalBuyer(buyer: Buyer): void {
  saveRecord(buyer, STORAGE_KEYS.buyers)
}

export function deleteLocalBuyer(id: string): void {
  deleteRecord<Buyer>(id, STORAGE_KEYS.buyers)
}

// ============================================
// FINANCE PROFILES
// ============================================

export function getLocalFinanceProfiles(mockProfiles: FinanceProfile[]): FinanceProfile[] {
  return mergeWithStorage(mockProfiles, STORAGE_KEYS.finance)
}

export function getLocalFinanceByBuyerId(
  buyerId: string,
  mockProfiles: FinanceProfile[]
): FinanceProfile | null {
  const all = mergeWithStorage(mockProfiles, STORAGE_KEYS.finance)
  return all.find(p => p.buyer_id === buyerId) || null
}

export function saveLocalFinanceProfile(profile: FinanceProfile): void {
  saveRecord(profile, STORAGE_KEYS.finance)
}

export function deleteLocalFinanceProfile(id: string): void {
  deleteRecord<FinanceProfile>(id, STORAGE_KEYS.finance)
}

// ============================================
// DEBUG UTILITIES
// ============================================

export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.leads)
  localStorage.removeItem(STORAGE_KEYS.buyers)
  localStorage.removeItem(STORAGE_KEYS.finance)
}

export function getLocalDataSummary(): { leads: number; buyers: number; finance: number } {
  return {
    leads: Object.keys(getStoredRecords<Lead>(STORAGE_KEYS.leads)).length,
    buyers: Object.keys(getStoredRecords<Buyer>(STORAGE_KEYS.buyers)).length,
    finance: Object.keys(getStoredRecords<FinanceProfile>(STORAGE_KEYS.finance)).length,
  }
}
