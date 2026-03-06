import type { UserGoal } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'
import { getDemoActiveGoals } from '~/server/utils/demo-data'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)

  if (isDemoUser(user)) {
    return {
      success: true,
      data: await getDemoActiveGoals(user.id),
      message: 'Demo goals fetched successfully',
    }
  }

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  // PGRST116 is "not found" — not a real error
  if (error && error.code !== 'PGRST116') {
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
})
