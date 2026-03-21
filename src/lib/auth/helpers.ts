import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { User } from './config'

// PHASE 2: Auth helper functions scaffold
// These will be fully implemented when auth UI is built

/**
 * Get current user from server component
 */
export async function getCurrentUser(): Promise<User | null> {
  // TODO: Implement when auth is ready
  // const supabase = createServerClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) return null
  // 
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('id', user.id)
  //   .single()
  // 
  // return profile

  // Return mock user for Phase 2
  return {
    id: 'user-1',
    email: 'john@mandateos.com',
    full_name: 'John Doe',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
  }
}

/**
 * Get current session from client component
 */
export async function getSession() {
  // TODO: Implement when auth is ready
  // const supabase = createBrowserClient()
  // return await supabase.auth.getSession()
  
  return {
    data: {
      session: {
        user: {
          id: 'user-1',
          email: 'john@mandateos.com',
        },
      },
    },
    error: null,
  }
}

/**
 * Sign out helper
 */
export async function signOut() {
  // TODO: Implement when auth is ready
  // const supabase = createBrowserClient()
  // await supabase.auth.signOut()
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  // TODO: Implement real check when auth is ready
  // For Phase 2, always return true to allow access
  return true
}

/**
 * Check if route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = ['/', '/leads', '/pipeline', '/activities', '/mandates', '/settings']
  return protectedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))
}
