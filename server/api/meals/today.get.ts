import { createClient } from '@supabase/supabase-js'
import type { Meal } from '~/server/database/schemas'

export default defineEventHandler(async (event) => {
  try {
    // Get user from auth context (you'll need to implement auth middleware)
    const user = event.context.user
    if (!user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    // Fetch today's meals
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('consumed_at', startOfDay.toISOString())
      .lte('consumed_at', endOfDay.toISOString())
      .order('consumed_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch meals'
      })
    }

    return {
      success: true,
      data: data as Meal[],
      message: 'Meals fetched successfully'
    }

  } catch (error: any) {
    console.error('Error fetching meals:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 