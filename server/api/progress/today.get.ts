import { createClient } from '@supabase/supabase-js'
import type { UserProgress } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'

export default defineEventHandler(async (event) => {
  try {
    // Validate authentication
    const user = requireAuth(event)
    const userId = user.id

    // Check if this is the demo user and return dummy data
    if (isDemoUser(user)) {
      // Import demo data helper
      const { useDemoData } = await import('~/composables/useDemoData')
      const { getTodaysProgress } = useDemoData()
      const todaysProgress = getTodaysProgress()

      if (todaysProgress) {
        // Override user_id to match the authenticated demo user
        const userDemoProgress: UserProgress = {
          ...todaysProgress,
          user_id: userId,
        }

        return {
          success: true,
          data: userDemoProgress,
          message: 'Demo progress fetched successfully',
        }
      }

      // Fallback if no progress data found
      const today = new Date()
      const fallbackProgress: UserProgress = {
        id: `demo_progress_${today.getDate()}`,
        user_id: userId,
        date: today.toISOString().split('T')[0],
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        created_at: today.toISOString(),
      }

      return {
        success: true,
        data: fallbackProgress,
        message: 'Demo progress fetched successfully',
      }
    }

    // Create Supabase client for non-demo users
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
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
