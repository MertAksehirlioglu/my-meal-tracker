import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '~/server/utils/auth'

interface DailyTotal {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  meal_count: number
}

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const userId = user.id

    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Last 7 days including today
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('meals')
      .select('consumed_at, total_calories, total_protein, total_carbs, total_fat')
      .eq('user_id', userId)
      .gte('consumed_at', sevenDaysAgo.toISOString())
      .order('consumed_at', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch weekly progress' })
    }

    // Aggregate by date
    const dailyMap = new Map<string, DailyTotal>()

    // Pre-fill all 7 days with zeros
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dailyMap.set(key, {
        date: key,
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        meal_count: 0,
      })
    }

    for (const row of data ?? []) {
      const key = new Date(row.consumed_at).toISOString().split('T')[0]
      const existing = dailyMap.get(key)
      if (existing) {
        existing.total_calories += row.total_calories ?? 0
        existing.total_protein += row.total_protein ?? 0
        existing.total_carbs += row.total_carbs ?? 0
        existing.total_fat += row.total_fat ?? 0
        existing.meal_count += 1
      }
    }

    return {
      success: true,
      data: Array.from(dailyMap.values()),
    }
  } catch (error: unknown) {
    if ((error as { statusCode?: number })?.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
