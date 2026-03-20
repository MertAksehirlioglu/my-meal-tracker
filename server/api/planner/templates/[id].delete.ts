import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

  const templateId = getRouterParam(event, 'id')
  if (!templateId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template ID is required',
    })
  }

  const supabase = getSupabaseClient()

  const { data: existing, error: fetchError } = await supabase
    .from('meal_templates')
    .select('id, user_id')
    .eq('id', templateId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Template not found' })
  }

  // Cascade: meal_inventory rows (and their meal_plan_slots) will be deleted by FK constraint
  const { error } = await supabase
    .from('meal_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete template',
    })
  }

  return sendApiResponse(null)
})
