import type { Meal } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'
import { getDemoMealsByDate } from '~/server/utils/demo-data'

export interface PaginatedMealsResponse {
  meals: Meal[]
  total: number
  limit: number
  offset: number
  date: string | null
}

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)

  const query = getQuery(event)
  const dateParam = query.date as string | undefined
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  const offset = Math.max(0, Number(query.offset) || 0)

  let targetDate: Date | null = null
  if (dateParam) {
    targetDate = new Date(dateParam)
    if (isNaN(targetDate.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid date parameter',
      })
    }
  }

  if (isDemoUser(user)) {
    const demoMeals = targetDate
      ? await getDemoMealsByDate(user.id, targetDate)
      : []
    const paginated = demoMeals.slice(offset, offset + limit)
    return {
      success: true,
      data: {
        meals: paginated,
        total: demoMeals.length,
        limit,
        offset,
        date: targetDate ? targetDate.toISOString().split('T')[0] : null,
      } satisfies PaginatedMealsResponse,
    }
  }

  const supabase = getSupabaseClient()

  let dbQuery = supabase
    .from('meals')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('consumed_at', { ascending: false })

  if (targetDate) {
    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0,
      0,
      0,
      0
    )
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      23,
      59,
      59,
      999
    )
    dbQuery = dbQuery
      .gte('consumed_at', startOfDay.toISOString())
      .lte('consumed_at', endOfDay.toISOString())
  }

  const { data, error, count } = await dbQuery.range(offset, offset + limit - 1)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch meals',
    })
  }

  return {
    success: true,
    data: {
      meals: data as Meal[],
      total: count ?? 0,
      limit,
      offset,
      date: targetDate ? targetDate.toISOString().split('T')[0] : null,
    } satisfies PaginatedMealsResponse,
  }
})
