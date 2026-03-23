// Auth configuration for Dealock
// PHASE 2: Scaffold for future auth implementation

export const AUTH_CONFIG = {
  // Protected routes that require authentication
  protectedRoutes: [
    '/',
    '/sellers',
    '/sellers/[id]',
    '/pipeline',
    '/activities',
    '/mandates',
    '/settings',
  ],
  
  // Public routes (accessible without auth)
  publicRoutes: [
    '/login',
    '/signup',
    '/auth/callback',
    '/auth/reset-password',
  ],
  
  // Redirect after login
  defaultRedirect: '/',
  
  // Redirect for unauthenticated users
  loginRedirect: '/login',
} as const

// User roles for future RBAC implementation
export type UserRole = 'admin' | 'agent' | 'viewer'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}
