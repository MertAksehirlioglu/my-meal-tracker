import { createClient } from '@supabase/supabase-js'
import type { Meal } from '~/server/database/schemas'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { user_id, name, meal_type, consumed_at, serving_size, total_calories, total_protein, total_carbs, total_fat, fiber, sugar, sodium, cholesterol, notes } = body

    // Validate required fields
    if (!user_id || !name || !meal_type || !consumed_at || total_calories === null || total_protein === null || total_carbs === null || total_fat === null) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insert meal into database
    const { data, error } = await supabase
      .from('meals')
      .insert({
        user_id,
        name,
        meal_type,
        consumed_at: new Date(consumed_at).toISOString(),
        serving_size,
        total_calories,
        total_protein,
        total_carbs,
        total_fat,
        fiber,
        sugar,
        sodium,
        cholesterol,
        notes
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save meal'
      })
    }

    return {
      success: true,
      data: data as Meal,
      message: 'Meal saved successfully'
    }

  } catch (error: any) {
    console.error('Error saving meal:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 