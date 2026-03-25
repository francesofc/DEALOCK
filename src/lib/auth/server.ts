/**
 * Server-only auth functions
 * 
 * These can only be imported in Server Components
 */

import { createClient as createServerClient } from '@/lib/supabase/server'
import { User } from './config'

/**
 * Get current user from server component
 * Phase 7: Real implementation replacing mock
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Return basic user info from auth if no profile
      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: 'admin', // Default role for pilot
        created_at: user.created_at,
      }
    }

    // Type assertion for profile data
    const profileData = profile as Record<string, any>

    return {
      id: user.id,
      email: user.email || '',
      full_name: profileData.full_name || user.email?.split('@')[0] || 'User',
      role: profileData.role || 'admin',
      avatar_url: profileData.avatar_url,
      created_at: user.created_at,
    }
  } catch (error) {
    console.error('[Auth] Error getting current user:', error)
    return null
  }
}
