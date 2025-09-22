import { createClient } from '@supabase/supabase-js'
import type { Meal } from '~/server/database/schemas'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Validate authentication - this is critical for security
    const user = requireAuth(event)

    const body = await readBody(event)
    const {
      name,
      meal_type,
      consumed_at,
      // serving_size, // TODO: Use serving_size when needed
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

    // Use authenticated user's ID instead of accepting from request body
    const user_id = user.id

    // Validate input data
    validateInput(
      {
        name,
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

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Prepare meal data
    const mealData = {
      user_id,
      name,
      meal_type,
      consumed_at: new Date(consumed_at).toISOString(),
      total_calories,
      total_protein,
      total_carbs,
      total_fat,
      total_fiber: total_fiber || null,
      total_sugar: total_sugar || null,
      notes: notes || null,
      image_url: image_url || null,
    }

    // Add AI metadata if provided
    if (ai_confidence !== null && ai_confidence !== undefined) {
      // Note: These fields would need to be added to the database schema
      // For now, we'll store them in notes or create new columns
      if (mealData.notes) {
        mealData.notes += `\n[AI Analysis: ${(ai_confidence * 100).toFixed(1)}% confidence, Method: ${analysis_method || 'ai'}]`
      } else {
        mealData.notes = `[AI Analysis: ${(ai_confidence * 100).toFixed(1)}% confidence, Method: ${analysis_method || 'ai'}]`
      }
    }

    // Insert meal into database
    const { data, error } = await supabase
      .from('meals')
      .insert(mealData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
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
  } catch (error: unknown) {
    console.error('Error saving meal:', error)

    if ((error as { statusCode?: number })?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
