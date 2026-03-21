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

  const mealId = getRouterParam(event, 'id')
  if (!mealId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Meal ID is required',
    })
  }

  const supabase = getSupabaseClient()

  // Verify the meal belongs to the authenticated user before deleting
  const { data: meal, error: fetchError } = await supabase
    .from('meals')
    .select('id, user_id')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !meal) {
    throw createError({ statusCode: 404, statusMessage: 'Meal not found' })
  }

  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId)
    .eq('user_id', user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete meal',
    })
  }

  return sendApiResponse(null)
})
