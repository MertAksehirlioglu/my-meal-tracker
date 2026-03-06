import type { User } from '@supabase/supabase-js'

/**
 * Creates a mock Supabase User for development/testing environments
 * when real JWT authentication is unavailable.
 */
export function createMockUser(): User {
  return {
    id: 'dev-user-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'dev@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email' },
    user_metadata: {},
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as User
}
