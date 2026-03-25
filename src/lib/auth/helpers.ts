import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { User } from './config'

/**
 * Get current user from server component
 * Phase 7: Real implementation - call from server components only
 */
export async function getCurrentUser(): Promise<User | null> {
  // This function should only be called from server components
  // It will be imported from a separate server-only file
  console.warn('getCurrentUser should be imported from @/lib/auth/server')
  return null
}

/**
 * Get current session from client component
 * Phase 7: Real implementation
 */
export async function getSession() {
  const supabase = createBrowserClient()
  return await supabase.auth.getSession()
}

/**
 * Sign out helper
 * Phase 7: Real implementation
 */
export async function signOut() {
  const supabase = createBrowserClient()
  await supabase.auth.signOut()
}

/**
 * Check if user is authenticated (client-side)
 * Phase 7: Real implementation
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createBrowserClient()
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * Check if route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  const publicPaths = ['/login', '/signup', '/auth/callback', '/auth/reset-password']
  return !publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))
}

/**
 * Sign in with email/password
 * Phase 7: New function for login
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = createBrowserClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

/**
 * Sign up with email/password
 * Phase 7: New function for registration
 */
export async function signUpWithPassword(email: string, password: string, metadata?: { full_name?: string }) {
  const supabase = createBrowserClient()
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
}
