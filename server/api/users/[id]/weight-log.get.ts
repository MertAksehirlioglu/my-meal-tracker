import { requireAuth } from '~/server/utils/auth'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('user_weight_log')
    .select('id, date, weight_kg, created_at')
    .eq('user_id', user.id)
    .order('date', { ascending: true })
    .limit(90)

  if (error) {
    // Table may not exist yet — return empty array gracefully
    return sendApiResponse([])
  }

  return sendApiResponse(data ?? [])
})
