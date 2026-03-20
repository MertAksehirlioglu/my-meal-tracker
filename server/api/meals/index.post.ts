import type { Meal } from '~/server/database/schemas'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'
import { sanitizeText } from '~/server/utils/sanitize'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

  const body = await readBody(event)
  const {
    name,
    meal_type,
    consumed_at,
    total_calories,
    total_protein,
    total_carbs,
    total_fat,
    total_fiber,
    total_sugar,
    notes,
    image_url,
    ai_confidence,
    analysis_method,
  } = body

  // Validate analysis_method against an allowlist to prevent injection
  const ALLOWED_ANALYSIS_METHODS = [
    'ai',
    'tensorflow',
    'manual',
    'huggingface',
    'openai',
  ]
  if (
    analysis_method !== null &&
    analysis_method !== undefined &&
    !ALLOWED_ANALYSIS_METHODS.includes(analysis_method)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid analysis_method value',
      data: { code: 'INVALID_INPUT' },
    })
  }

  const sanitizedName = typeof name === 'string' ? sanitizeText(name, 255) : name
  const sanitizedNotes =
    typeof notes === 'string' ? sanitizeText(notes, 2000) : notes

  validateInput(
    {
      name: sanitizedName,
      meal_type,
      consumed_at,
      total_calories,
      total_protein,
      total_carbs,
      total_fat,
    },
    [
      'name',
      'meal_type',
      'consumed_at',
      'total_calories',
      'total_protein',
      'total_carbs',
      'total_fat',
    ],
    {
      name: validators.isString,
      meal_type: validators.isMealType,
      consumed_at: validators.isDateString,
      total_calories: validators.isNumber,
      total_protein: validators.isNumber,
      total_carbs: validators.isNumber,
      total_fat: validators.isNumber,
      total_fiber: validators.isNumber,
      total_sugar: validators.isNumber,
      ai_confidence: validators.isConfidence,
      image_url: validators.isUrl,
    }
  )

  const supabase = getSupabaseClient()

  const mealData = {
    user_id: user.id,
    name: sanitizedName,
    meal_type,
    consumed_at: new Date(consumed_at).toISOString(),
    total_calories,
    total_protein,
    total_carbs,
    total_fat,
    total_fiber: total_fiber || null,
    total_sugar: total_sugar || null,
    notes: sanitizedNotes || null,
    image_url: image_url || null,
  }

  // Add AI metadata if provided
  if (ai_confidence !== null && ai_confidence !== undefined) {
    if (mealData.notes) {
      mealData.notes += `\n[AI Analysis: ${(ai_confidence * 100).toFixed(1)}% confidence, Method: ${analysis_method || 'ai'}]`
    } else {
      mealData.notes = `[AI Analysis: ${(ai_confidence * 100).toFixed(1)}% confidence, Method: ${analysis_method || 'ai'}]`
    }
  }

  const { data, error } = await supabase
    .from('meals')
    .insert(mealData)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save meal',
    })
  }

  return {
    success: true,
    data: data as Meal,
    message: 'Meal saved successfully',
  }
})
