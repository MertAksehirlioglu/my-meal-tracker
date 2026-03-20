import type { MealTemplate } from '~/server/database/schemas'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'

const MAX_NAME_LENGTH = 255
const MAX_NOTES_LENGTH = 1000

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

  const body = await readBody(event)
  const {
    name,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    serving_size,
    notes,
    image_url,
  } = body

  if (typeof name === 'string' && name.length > MAX_NAME_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Name must be ${MAX_NAME_LENGTH} characters or fewer`,
    })
  }
  if (typeof notes === 'string' && notes.length > MAX_NOTES_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Notes must be ${MAX_NOTES_LENGTH} characters or fewer`,
    })
  }

  validateInput(
    { name, calories, protein, carbs, fat },
    ['name', 'calories', 'protein', 'carbs', 'fat'],
    {
      name: validators.isString,
      calories: validators.isNumber,
      protein: validators.isNumber,
      carbs: validators.isNumber,
      fat: validators.isNumber,
      fiber: validators.isNumber,
      sugar: validators.isNumber,
    }
  )

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

  const { data, error } = await supabase
    .from('meal_templates')
    .update({
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber: fiber ?? null,
      sugar: sugar ?? null,
      serving_size: serving_size ?? null,
      notes: notes ?? null,
      image_url: image_url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update template',
    })
  }

  return sendApiResponse(data as MealTemplate)
})
