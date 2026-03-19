import type { MealTemplate } from '~/server/database/schemas'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'

const MAX_NAME_LENGTH = 255
const MAX_NOTES_LENGTH = 1000

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

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
    source_meal_id,
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

  const { data, error } = await supabase
    .from('meal_templates')
    .insert({
      user_id: user.id,
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
      source_meal_id: source_meal_id ?? null,
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create template',
    })
  }

  return {
    success: true,
    data: data as MealTemplate,
    message: 'Template created successfully',
  }
})
