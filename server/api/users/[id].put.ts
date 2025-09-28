import { createClient } from '@supabase/supabase-js'
import type { UpdateUser } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'

export default defineEventHandler(async (event) => {
  try {
    // Validate authentication
    const user = requireAuth(event)
    const requestedUserId = getRouterParam(event, 'id')

    // Ensure user can only update their own profile
    if (user.id !== requestedUserId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Can only update your own profile',
      })
    }

    // Block demo users from updating profile
    blockDemoUserWrite(event)

    // Get request body
    const body = await readBody(event)
    const updates: UpdateUser = body

    // Validate required fields
    if (!updates || typeof updates !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body',
      })
    }

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update user profile',
      })
    }

    return {
      success: true,
      data,
      message: 'Profile updated successfully',
    }
  } catch (error: unknown) {
    console.error('Error updating user profile:', error)

    if ((error as { statusCode?: number })?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})