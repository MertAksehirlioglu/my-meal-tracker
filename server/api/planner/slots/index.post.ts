import type { MealPlanSlot } from '~/server/database/schemas'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

  const body = await readBody(event)
  const { inventory_id, planned_date, meal_type } = body

  validateInput(
    { inventory_id, planned_date, meal_type },
    ['inventory_id', 'planned_date', 'meal_type'],
    {
      inventory_id: validators.isString,
      planned_date: validators.isDateString,
      meal_type: validators.isMealType,
    }
  )

  const supabase = getSupabaseClient()

  // Verify the inventory entry belongs to this user and get quantity
  const { data: inventory, error: invError } = await supabase
    .from('meal_inventory')
    .select('id, user_id, quantity')
    .eq('id', inventory_id)
    .eq('user_id', user.id)
    .single()

  if (invError || !inventory) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Inventory entry not found',
    })
  }

  // Check available portions
  const { count: usedCount, error: countError } = await supabase
    .from('meal_plan_slots')
    .select('id', { count: 'exact', head: true })
    .eq('inventory_id', inventory_id)

  if (countError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check portion availability',
    })
  }

  if ((usedCount ?? 0) >= inventory.quantity) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'No portions remaining in inventory for this template this week',
    })
  }

  const { data, error } = await supabase
    .from('meal_plan_slots')
    .insert({
      user_id: user.id,
      inventory_id,
      planned_date,
      meal_type,
      is_confirmed: false,
    })
    .select(
      `
      *,
      inventory:meal_inventory(
        *,
        template:meal_templates(*)
      )
    `
    )
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create slot assignment',
    })
  }

  return {
    success: true,
    data: data as MealPlanSlot,
    message: 'Meal added to plan',
  }
})
