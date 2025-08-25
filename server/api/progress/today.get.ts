import { createClient } from '@supabase/supabase-js'
import type { UserProgress } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Validate authentication
    const user = requireAuth(event)
    const userId = user.id

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    )

    // Fetch today's meals and calculate progress
    const { data: meals, error } = await supabase
      .from('meals')
      .select('total_calories, total_protein, total_carbs, total_fat')
      .eq('user_id', userId)
      .gte('consumed_at', startOfDay.toISOString())
      .lte('consumed_at', endOfDay.toISOString())

    if (error) {
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch progress',
      })
    }

    // Calculate totals
    const progress: UserProgress = {
      id: `temp_${userId}_${today.toISOString().split('T')[0]}`,
      user_id: userId,
      date: today.toISOString().split('T')[0],
      total_calories:
        meals?.reduce((sum, meal) => sum + (meal.total_calories || 0), 0) || 0,
      total_protein:
        meals?.reduce((sum, meal) => sum + (meal.total_protein || 0), 0) || 0,
      total_carbs:
        meals?.reduce((sum, meal) => sum + (meal.total_carbs || 0), 0) || 0,
      total_fat:
        meals?.reduce((sum, meal) => sum + (meal.total_fat || 0), 0) || 0,
      created_at: new Date().toISOString(),
    }

    return {
      success: true,
      data: progress,
      message: 'Progress fetched successfully',
    }
  } catch (error: unknown) {
    console.error('Error fetching progress:', error)

    if ((error as { statusCode?: number })?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
