import { createClient } from '@supabase/supabase-js'
import type { UserGoal } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const userId = user.id

    // Return demo goals as a list for the demo user
    if (isDemoUser(user)) {
      const { useDemoData } = await import('~/composables/useDemoData')
      const { demoGoals } = useDemoData()

      const userDemoGoal: UserGoal = {
        ...demoGoals,
        user_id: userId,
      }

      return {
        success: true,
        data: [userDemoGoal],
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch goals' })
    }

    return {
      success: true,
      data: data as UserGoal[],
    }
  } catch (error: unknown) {
    if ((error as { statusCode?: number })?.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
