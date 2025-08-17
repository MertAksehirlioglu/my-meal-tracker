import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Get user from auth context
    const user = event.context.user

    if (!user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - user ID required',
      })
    }

    // Create Supabase client with user's session (not service role)
    // This ensures RLS policies work correctly
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.substring(7) // Remove 'Bearer ' prefix
    
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Add sample meal data for the user
    const today = new Date()
    const sampleMeals = [
      {
        user_id: user.id,
        name: 'Chicken Salad Bowl',
        meal_type: 'lunch',
        consumed_at: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        total_calories: 450,
        total_protein: 35,
        total_carbs: 25,
        total_fat: 18,
        notes: 'Grilled chicken with mixed greens and avocado'
      },
      {
        user_id: user.id,
        name: 'Greek Yogurt with Berries',
        meal_type: 'breakfast',
        consumed_at: new Date(today.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        total_calories: 220,
        total_protein: 15,
        total_carbs: 30,
        total_fat: 5,
        notes: 'Greek yogurt topped with blueberries and honey'
      }
    ]

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

    // Add sample user goals
    const sampleGoals = {
      user_id: user.id,
      target_calories: 2000,
      target_protein: 150,
      target_carbs: 250,
      target_fat: 65,
      start_date: today.toISOString().split('T')[0],
      is_active: true
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
        goals: goalsData
      }
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