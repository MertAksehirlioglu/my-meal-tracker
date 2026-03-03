import { createClient } from '@supabase/supabase-js'
import type { Meal } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const userId = user.id

    const query = getQuery(event)
    const dateParam = query.date as string | undefined

    // Default to today if no date given
    const targetDate = dateParam ? new Date(dateParam) : new Date()

    if (isNaN(targetDate.getTime())) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid date parameter' })
    }

    // Check if this is the demo user and return filtered dummy data
    if (isDemoUser(user)) {
      const { useDemoData } = await import('~/composables/useDemoData')
      const { demoMeals } = useDemoData()

      const targetDateStr = targetDate.toISOString().split('T')[0]
      const filtered: Meal[] = demoMeals
        .filter((meal) => meal.consumed_at.split('T')[0] === targetDateStr)
        .map((meal) => ({ ...meal, user_id: userId }))

      return {
        success: true,
        data: filtered,
        date: targetDateStr,
      }
    }

    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0, 0, 0, 0
    )
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      23, 59, 59, 999
    )

    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('consumed_at', startOfDay.toISOString())
      .lte('consumed_at', endOfDay.toISOString())
      .order('consumed_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch meals' })
    }

    return {
      success: true,
      data: data as Meal[],
      date: targetDate.toISOString().split('T')[0],
    }
  } catch (error: unknown) {
    if ((error as { statusCode?: number })?.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
