import type { User } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'
import { getDemoUserProfile } from '~/server/utils/demo-data'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  const requestedUserId = getRouterParam(event, 'id')

  if (user.id !== requestedUserId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Can only access your own profile',
    })
  }

  if (isDemoUser(user)) {
    return sendApiResponse(await getDemoUserProfile(user.id, user.email))
  }

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // PGRST116 is "not found" — not a real error
  if (error && error.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user profile',
    })
  }

  return sendApiResponse(data as User | null)
})
