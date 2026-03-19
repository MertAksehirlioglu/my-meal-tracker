import type { Meal, UpdateMeal } from '~/server/database/schemas'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'

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

  const body = await readBody(event)
  const {
    name,
    meal_type,
    consumed_at,
    total_calories,
    total_protein,
    total_carbs,
    total_fat,
    total_fiber,
    total_sugar,
    notes,
  } = body

  validateInput(
    {
      name,
      meal_type,
      consumed_at,
      total_calories,
      total_protein,
      total_carbs,
      total_fat,
    },
    [
      'name',
      'meal_type',
      'consumed_at',
      'total_calories',
      'total_protein',
      'total_carbs',
      'total_fat',
    ],
    {
      name: validators.isString,
      meal_type: validators.isMealType,
      consumed_at: validators.isDateString,
      total_calories: validators.isNumber,
      total_protein: validators.isNumber,
      total_carbs: validators.isNumber,
      total_fat: validators.isNumber,
      total_fiber: validators.isNumber,
      total_sugar: validators.isNumber,
    }
  )

  const supabase = getSupabaseClient()

  // Verify the meal belongs to the authenticated user before updating
  const { data: existingMeal, error: fetchError } = await supabase
    .from('meals')
    .select('id, user_id')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existingMeal) {
    throw createError({ statusCode: 404, statusMessage: 'Meal not found' })
  }

  const updates: UpdateMeal = {
    name,
    meal_type,
    consumed_at: new Date(consumed_at).toISOString(),
    total_calories,
    total_protein,
    total_carbs,
    total_fat,
    total_fiber: total_fiber ?? null,
    total_sugar: total_sugar ?? null,
    notes: notes ?? null,
  }

  const { data, error } = await supabase
    .from('meals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', mealId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update meal',
    })
  }

  return {
    success: true,
    data: data as Meal,
    message: 'Meal updated successfully',
  }
})
