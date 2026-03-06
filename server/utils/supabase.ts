import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client using service role credentials.
 * For routes that need user-scoped access respecting RLS,
 * use getSupabaseClientWithAuth instead.
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Creates a Supabase client that forwards the user's JWT,
 * allowing RLS policies to apply correctly.
 */
export function getSupabaseClientWithAuth(token: string) {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_KEY!
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}
