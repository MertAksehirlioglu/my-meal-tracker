import type { FoodItem } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'
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
    return sendApiResponse(getDemoFoodItems(mealId))
  }

  const supabase = getSupabaseClient()

  // Fetch without user_id filter so we can distinguish 404 vs 403
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select('id, user_id')
    .eq('id', mealId)
    .single()

  if (mealError || !meal) {
    throw createError({ statusCode: 404, statusMessage: 'Meal not found' })
  }

  if (meal.user_id !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: meal does not belong to you',
    })
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

  return sendApiResponse(data as FoodItem[])
})
