import type { UpdateUser } from '~/server/database/schemas'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  const requestedUserId = getRouterParam(event, 'id')

  if (user.id !== requestedUserId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Can only update your own profile',
    })
  }

  blockDemoUserWrite(event)

  const body = await readBody(event)
  const updates: UpdateUser = body

  if (!updates || typeof updates !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
    })
  }

  validateInput(updates as Record<string, unknown>, [], {
    name: validators.isString,
    email: validators.isEmail,
    height: validators.isNumber,
    weight: validators.isNumber,
    age: validators.isNumber,
    daily_calorie_target: validators.isNumber,
  })

  const supabase = getSupabaseClient()

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
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user profile',
    })
  }

  return sendApiResponse(data)
})
