import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

  const slotId = getRouterParam(event, 'id')
  if (!slotId) {
    throw createError({ statusCode: 400, statusMessage: 'Slot ID is required' })
  }

  const supabase = getSupabaseClient()

  const { data: existing, error: fetchError } = await supabase
    .from('meal_plan_slots')
    .select('id, user_id')
    .eq('id', slotId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Slot not found' })
  }

  const { error } = await supabase
    .from('meal_plan_slots')
    .delete()
    .eq('id', slotId)
    .eq('user_id', user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove slot assignment',
    })
  }

  return sendApiResponse(null)
})
