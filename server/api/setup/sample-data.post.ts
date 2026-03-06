import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClientWithAuth } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'
import { getDemoSampleMealsAndGoals } from '~/server/utils/demo-data'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

  // Use user's JWT so RLS policies apply correctly
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.substring(7) // Remove 'Bearer ' prefix

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authorization token',
    })
  }

  const supabase = getSupabaseClientWithAuth(token)

  const { meals, goals } = await getDemoSampleMealsAndGoals()

  const sampleMeals = meals.map((meal) => ({
    user_id: user.id,
    name: meal.name,
    meal_type: meal.meal_type,
    consumed_at: meal.consumed_at,
    total_calories: meal.total_calories,
    total_protein: meal.total_protein,
    total_carbs: meal.total_carbs,
    total_fat: meal.total_fat,
    total_fiber: meal.total_fiber,
    total_sugar: meal.total_sugar,
    notes: meal.notes,
  }))

  const { data: mealsData, error: mealsError } = await supabase
    .from('meals')
    .insert(sampleMeals)
    .select()

  if (mealsError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create sample meals',
    })
  }

  const sampleGoals = {
    user_id: user.id,
    target_calories: goals.target_calories,
    target_protein: goals.target_protein,
    target_carbs: goals.target_carbs,
    target_fat: goals.target_fat,
    start_date: goals.start_date,
    is_active: goals.is_active,
  }

  const { data: goalsData, error: goalsError } = await supabase
    .from('user_goals')
    .insert(sampleGoals)
    .select()

  if (goalsError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create sample goals',
    })
  }

  return {
    success: true,
    message: 'Sample data created successfully',
    data: {
      meals: mealsData,
      goals: goalsData,
    },
  }
})
