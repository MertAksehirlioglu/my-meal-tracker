import { createClient } from '@supabase/supabase-js'
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

/**
 * Creates a Supabase client using the configured credentials.
 * Note: RLS enforcement depends on whether SUPABASE_KEY is the anon key or service role key.
 * All queries that filter by user should explicitly scope by user_id.
 */
export function getSupabaseClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig()
  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Creates a Supabase client that forwards the user's JWT,
 * allowing RLS policies to apply correctly.
 */
export function getSupabaseClientWithAuth(token: string) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig()
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}
