import type { MealTemplate } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

  const mealId = getRouterParam(event, 'id')
  if (!mealId) {
    throw createError({ statusCode: 400, statusMessage: 'Meal ID is required' })
  }

  const supabase = getSupabaseClient()

  // Fetch the source meal (must belong to this user)
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select('*')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single()

  if (mealError || !meal) {
    throw createError({ statusCode: 404, statusMessage: 'Meal not found' })
  }

  const { data, error } = await supabase
    .from('meal_templates')
    .insert({
      user_id: user.id,
      name: meal.name,
      calories: meal.total_calories,
      protein: meal.total_protein,
      carbs: meal.total_carbs,
      fat: meal.total_fat,
      fiber: meal.total_fiber ?? null,
      sugar: meal.total_sugar ?? null,
      image_url: meal.image_url ?? null,
      notes: meal.notes ?? null,
      source_meal_id: meal.id,
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save template',
    })
  }

  return {
    success: true,
    data: data as MealTemplate,
    message: 'Meal saved as template',
  }
})
