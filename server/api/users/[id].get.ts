import { createClient } from '@supabase/supabase-js'
import type { User } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'

export default defineEventHandler(async (event) => {
  try {
    // Validate authentication
    const user = requireAuth(event)
    const requestedUserId = getRouterParam(event, 'id')

    // Ensure user can only access their own profile
    if (user.id !== requestedUserId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Can only access your own profile',
      })
    }

    // Check if this is the demo user and return demo data
    if (isDemoUser(user)) {
      // Import demo data helper
      const { useDemoData } = await import('~/composables/useDemoData')
      const { demoUser } = useDemoData()

      // Override user_id to match the authenticated demo user
      const userDemoProfile: User = {
        ...demoUser,
        id: user.id,
        email: user.email || demoUser.email,
      }

      return {
        success: true,
        data: userDemoProfile,
        message: 'Demo profile fetched successfully',
      }
    }

    // Create Supabase client for non-demo users
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch user profile
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found"
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user profile',
      })
    }

    return {
      success: true,
      data: data as User | null,
      message: 'Profile fetched successfully',
    }
  } catch (error: unknown) {
    console.error('Error fetching user profile:', error)

    if ((error as { statusCode?: number })?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})