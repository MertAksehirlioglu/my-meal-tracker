import type { UserProgress } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
  createErrorResponse,
  ApiErrorCode,
} from '~/server/utils/api-error'
import { getTodayRange } from '~/server/utils/date-helpers'
import { getDemoTodayProgress } from '~/server/utils/demo-data'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)

  if (isDemoUser(user)) {
    const data = await getDemoTodayProgress(user.id)
    return sendApiResponse(data)
  }

  const supabase = getSupabaseClient()
  const { startOfDay, endOfDay } = getTodayRange()

  const { data, error } = await supabase
    .rpc('get_today_nutrition', {
      p_user_id: user.id,
      p_start: startOfDay.toISOString(),
      p_end: endOfDay.toISOString(),
    })
    .single()

  if (error) {
    createErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      'Failed to fetch progress',
      500,
      error.message
    )
  }

  const todayDate = new Date().toISOString().split('T')[0]
  const progress: UserProgress = {
    id: `temp_${user.id}_${todayDate}`,
    user_id: user.id,
    date: todayDate,
    total_calories: Number(data?.total_calories ?? 0),
    total_protein: Number(data?.total_protein ?? 0),
    total_carbs: Number(data?.total_carbs ?? 0),
    total_fat: Number(data?.total_fat ?? 0),
    created_at: new Date().toISOString(),
  }

  return sendApiResponse(progress)
})
