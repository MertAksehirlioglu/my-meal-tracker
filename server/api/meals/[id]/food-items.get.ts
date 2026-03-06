import type { FoodItem } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'
import { getDemoFoodItems } from '~/server/utils/demo-data'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  const mealId = getRouterParam(event, 'id')

  if (!mealId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Meal ID is required',
    })
  }

  if (isDemoUser(user)) {
    return { success: true, data: getDemoFoodItems(mealId) }
  }

  const supabase = getSupabaseClient()

  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select('id')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single()

  if (mealError || !meal) {
    throw createError({ statusCode: 404, statusMessage: 'Meal not found' })
  }

  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .eq('meal_id', mealId)
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch food items',
    })
  }

  return { success: true, data: data as FoodItem[] }
})
