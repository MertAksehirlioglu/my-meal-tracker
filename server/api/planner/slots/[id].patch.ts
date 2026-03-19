import type { MealPlanSlot } from '~/server/database/schemas'
import { requireAuth, validators } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

  const slotId = getRouterParam(event, 'id')
  if (!slotId) {
    throw createError({ statusCode: 400, statusMessage: 'Slot ID is required' })
  }

  const body = await readBody(event)
  const { planned_date, meal_type, is_confirmed } = body

  if (planned_date !== undefined && !validators.isDateString(planned_date)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'planned_date must be a valid date string',
    })
  }
  if (meal_type !== undefined && !validators.isMealType(meal_type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'meal_type must be breakfast, lunch, dinner, or snack',
    })
  }
  if (is_confirmed !== undefined && typeof is_confirmed !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'is_confirmed must be a boolean',
    })
  }

  const supabase = getSupabaseClient()

  const { data: existing, error: fetchError } = await supabase
    .from('meal_plan_slots')
    .select('id, user_id, is_confirmed')
    .eq('id', slotId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Slot not found' })
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (planned_date !== undefined) updates.planned_date = planned_date
  if (meal_type !== undefined) updates.meal_type = meal_type
  if (is_confirmed !== undefined) {
    updates.is_confirmed = is_confirmed
    updates.confirmed_at = is_confirmed ? new Date().toISOString() : null
  }

  const { data, error } = await supabase
    .from('meal_plan_slots')
    .update(updates)
    .eq('id', slotId)
    .eq('user_id', user.id)
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
      statusMessage: 'Failed to update slot',
    })
  }

  return {
    success: true,
    data: data as MealPlanSlot,
    message: 'Slot updated successfully',
  }
})
