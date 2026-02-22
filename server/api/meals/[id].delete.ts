import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    blockDemoUserWrite(event)

    const mealId = getRouterParam(event, 'id')
    if (!mealId) {
      throw createError({ statusCode: 400, statusMessage: 'Meal ID is required' })
    }

    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify the meal belongs to the authenticated user before deleting
    const { data: meal, error: fetchError } = await supabase
      .from('meals')
      .select('id, user_id')
      .eq('id', mealId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !meal) {
      throw createError({ statusCode: 404, statusMessage: 'Meal not found' })
    }

    const { error } = await supabase.from('meals').delete().eq('id', mealId).eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete meal' })
    }

    return { success: true, message: 'Meal deleted successfully' }
  } catch (error: unknown) {
    if ((error as { statusCode?: number })?.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
