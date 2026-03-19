import { requireAuth } from '~/server/utils/auth'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  createSuccessResponse,
  createErrorResponse,
  ApiErrorCode,
} from '~/server/utils/api-error'
import { readBody, createError } from 'h3'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = (await readBody(event)) as {
    weight_kg?: unknown
    date?: unknown
  }

  const weight_kg = Number(body?.weight_kg)
  if (!weight_kg || weight_kg <= 0 || weight_kg > 500) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid weight value',
    })
  }

  const date =
    typeof body?.date === 'string'
      ? body.date
      : new Date().toISOString().split('T')[0]

  const supabase = getSupabaseClient()

  // Upsert by user_id + date so re-logging same day updates the entry
  const { data, error } = await supabase
    .from('user_weight_log')
    .upsert(
      { user_id: user.id, date, weight_kg },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  if (error) {
    return createErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      'Failed to save weight log',
      500,
      error.message
    )
  }

  return createSuccessResponse(data, 'Weight logged successfully')
})
