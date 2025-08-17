import { createClient } from '@supabase/supabase-js'
import type { UserGoal } from '~/server/database/schemas'

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

    // Fetch active user goals
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found"
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch goals',
      })
    }

    return {
      success: true,
      data: data as UserGoal | null,
      message: 'Goals fetched successfully',
    }
  } catch (error: unknown) {
    console.error('Error fetching goals:', error)

    if ((error as { statusCode?: number })?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
