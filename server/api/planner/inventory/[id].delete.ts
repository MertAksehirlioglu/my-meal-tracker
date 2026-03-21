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

  const inventoryId = getRouterParam(event, 'id')
  if (!inventoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Inventory ID is required',
    })
  }

  const supabase = getSupabaseClient()

  const { data: existing, error: fetchError } = await supabase
    .from('meal_inventory')
    .select('id, user_id')
    .eq('id', inventoryId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Inventory entry not found',
    })
  }

  // Cascade: meal_plan_slots referencing this inventory entry are deleted by FK
  const { error } = await supabase
    .from('meal_inventory')
    .delete()
    .eq('id', inventoryId)
    .eq('user_id', user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete inventory entry',
    })
  }

  return sendApiResponse(null)
})
