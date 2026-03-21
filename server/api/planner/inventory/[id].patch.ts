import type { MealInventory } from '~/server/database/schemas'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'
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

  const body = await readBody(event)
  const { quantity } = body

  validateInput({ quantity }, ['quantity'], { quantity: validators.isNumber })

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quantity must be a positive integer',
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

  const { data, error } = await supabase
    .from('meal_inventory')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', inventoryId)
    .eq('user_id', user.id)
    .select('*, template:meal_templates(*)')
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update inventory',
    })
  }

  return sendApiResponse(data as MealInventory)
})
