import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'

export default defineEventHandler(async (event) => {
  try {
    // Validate authentication
    const user = requireAuth(event)

    // Block demo users from creating sample data
    blockDemoUserWrite(event)

    // Create Supabase client with user's session (not service role)
    // This ensures RLS policies work correctly
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.substring(7) // Remove 'Bearer ' prefix

    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Import demo data helper to get sample meals
    const { useDemoData } = await import('~/composables/useDemoData')
    const { getTodaysMeals, demoGoals } = useDemoData()
    const sampleMealsTemplate = getTodaysMeals()

    // Add sample meal data for the user
    const sampleMeals = sampleMealsTemplate.map((meal) => ({
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

    // Insert sample meals
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .insert(sampleMeals)
      .select()

    if (mealsError) {
      console.error('Error creating sample meals:', mealsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create sample meals',
      })
    }

    // Add sample user goals from demo data
    const sampleGoals = {
      user_id: user.id,
      target_calories: demoGoals.target_calories,
      target_protein: demoGoals.target_protein,
      target_carbs: demoGoals.target_carbs,
      target_fat: demoGoals.target_fat,
      start_date: demoGoals.start_date,
      is_active: demoGoals.is_active,
    }

    const { data: goalsData, error: goalsError } = await supabase
      .from('user_goals')
      .insert(sampleGoals)
      .select()

    if (goalsError) {
      console.error('Error creating sample goals:', goalsError)
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
  } catch (error: unknown) {
    console.error('Error creating sample data:', error)

    if ((error as { statusCode?: number })?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
