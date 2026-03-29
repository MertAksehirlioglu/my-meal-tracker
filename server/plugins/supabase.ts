import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient } from '~/server/utils/supabase'

declare module 'h3' {
  interface H3EventContext {
    supabase: SupabaseClient
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    event.context.supabase = getSupabaseClient()
  })
})
