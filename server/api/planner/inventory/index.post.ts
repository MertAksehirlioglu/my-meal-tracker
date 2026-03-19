import type { MealInventory } from '~/server/database/schemas'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'
import { isMonday } from '~/lib/week-utils'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

  const body = await readBody(event)
  const { template_id, week_start, quantity } = body

  if (!week_start || !isMonday(week_start)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'week_start must be a Monday (YYYY-MM-DD)',
    })
  }

  validateInput(
    { template_id, week_start, quantity },
    ['template_id', 'week_start', 'quantity'],
    {
      template_id: validators.isString,
      quantity: validators.isNumber,
    }
  )

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quantity must be a positive integer',
    })
  }

  const supabase = getSupabaseClient()

  // Verify the template belongs to this user
  const { data: template, error: tplError } = await supabase
    .from('meal_templates')
    .select('id')
    .eq('id', template_id)
    .eq('user_id', user.id)
    .single()

  if (tplError || !template) {
    throw createError({ statusCode: 404, statusMessage: 'Template not found' })
  }

  // Upsert: if already exists, add to quantity
  const { data: existing } = await supabase
    .from('meal_inventory')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('template_id', template_id)
    .eq('week_start', week_start)
    .single()

  let result

  if (existing) {
    const { data, error } = await supabase
      .from('meal_inventory')
      .update({
        quantity: existing.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*, template:meal_templates(*)')
      .single()

    if (error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update inventory',
      })
    result = data
  } else {
    const { data, error } = await supabase
      .from('meal_inventory')
      .insert({ user_id: user.id, template_id, week_start, quantity })
      .select('*, template:meal_templates(*)')
      .single()

    if (error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create inventory entry',
      })
    result = data
  }

  return {
    success: true,
    data: { ...result, portions_used: 0 } as MealInventory,
    message: 'Inventory updated successfully',
  }
})
