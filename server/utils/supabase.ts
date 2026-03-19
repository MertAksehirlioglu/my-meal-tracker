import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createError } from 'h3'

function getSupabaseConfig(): { supabaseUrl: string; supabaseKey: string } {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error: missing Supabase credentials',
    })
  }

  return { supabaseUrl, supabaseKey }
}

let _client: SupabaseClient | null = null

/**
 * Returns a shared Supabase client instance, creating it once on first call.
 * Note: RLS enforcement depends on whether SUPABASE_KEY is the anon key or service role key.
 * All queries that filter by user should explicitly scope by user_id.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig()
    _client = createClient(supabaseUrl, supabaseKey)
  }
  return _client
}

/**
 * Creates a Supabase client that forwards the user's JWT,
 * allowing RLS policies to apply correctly.
 * A new client is created per request since the token is user-specific.
 */
export function getSupabaseClientWithAuth(token: string): SupabaseClient {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig()
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}
