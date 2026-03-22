import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
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
    return sendApiResponse(data)
  }

  const supabase = getSupabaseClient()
  const { startDate, endDate } = getDateRangeForDays(7)

  const { data: rows, error } = await supabase.rpc('get_weekly_nutrition', {
    p_user_id: user.id,
    p_start: startDate.toISOString(),
    p_end: endDate.toISOString(),
  })

  if (error) {
    createErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      'Failed to fetch weekly progress',
      500,
      error.message
    )
  }

  const dailyMap = buildWeeklyDateMap()

  for (const row of rows ?? []) {
    const existing = dailyMap.get(row.date as string)
    if (existing) {
      existing.total_calories = Number(row.total_calories)
      existing.total_protein = Number(row.total_protein)
      existing.total_carbs = Number(row.total_carbs)
      existing.total_fat = Number(row.total_fat)
      existing.meal_count = Number(row.meal_count)
    }
  }

  return sendApiResponse(Array.from(dailyMap.values()))
})
