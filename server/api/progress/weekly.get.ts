import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  createSuccessResponse,
  createErrorResponse,
  ApiErrorCode,
} from '~/server/utils/api-error'
import {
  buildWeeklyDateMap,
  getDateRangeForDays,
} from '~/server/utils/date-helpers'
import { getDemoWeeklyProgress } from '~/server/utils/demo-data'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)

  if (isDemoUser(user)) {
    const data = await getDemoWeeklyProgress()
    return createSuccessResponse(data)
  }

  const supabase = getSupabaseClient()
  const { startDate, endDate } = getDateRangeForDays(7)

  const { data, error } = await supabase
    .from('meals')
    .select(
      'consumed_at, total_calories, total_protein, total_carbs, total_fat'
    )
    .eq('user_id', user.id)
    .gte('consumed_at', startDate.toISOString())
    .lte('consumed_at', endDate.toISOString())
    .order('consumed_at', { ascending: true })

  if (error) {
    createErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      'Failed to fetch weekly progress',
      500,
      error.message
    )
  }

  const dailyMap = buildWeeklyDateMap()

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

  return createSuccessResponse(Array.from(dailyMap.values()))
})
