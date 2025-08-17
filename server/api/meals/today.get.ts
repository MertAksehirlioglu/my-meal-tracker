import { createClient } from '@supabase/supabase-js'
import type { Meal } from '~/server/database/schemas'

export default defineEventHandler(async (event) => {
  try {
    // Get user from auth context
    const user = event.context.user

    // For development: if no user in context, get from query params
    let userId = user?.id
    if (!userId) {
      const query = getQuery(event)
      userId = query.user_id as string

      if (!userId) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized - user ID required',
        })
      }
    }

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get today's date range (use local timezone)
    const today = new Date()
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    )
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    )

    console.log('Fetching meals for user:', userId)
    console.log('Date range:', { startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString() })

    // Fetch today's meals
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('consumed_at', startOfDay.toISOString())
      .lte('consumed_at', endOfDay.toISOString())
      .order('consumed_at', { ascending: false })

    console.log('Meals query result:', { data, error, count: data?.length })

    if (error) {
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch meals',
      })
    }

    return {
      success: true,
      data: data as Meal[],
      message: 'Meals fetched successfully',
    }
  } catch (error: unknown) {
    console.error('Error fetching meals:', error)

    if ((error as { statusCode?: number })?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
