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

  const { data: meals, error } = await supabase
    .from('meals')
    .select('total_calories, total_protein, total_carbs, total_fat')
    .eq('user_id', user.id)
    .gte('consumed_at', startOfDay.toISOString())
    .lte('consumed_at', endOfDay.toISOString())

  if (error) {
    createErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      'Failed to fetch progress',
      500,
      error.message
    )
  }

  const today = new Date()
  const progress: UserProgress = {
    id: `temp_${user.id}_${today.toISOString().split('T')[0]}`,
    user_id: user.id,
    date: today.toISOString().split('T')[0],
    total_calories:
      meals?.reduce((sum, meal) => sum + (meal.total_calories || 0), 0) || 0,
    total_protein:
      meals?.reduce((sum, meal) => sum + (meal.total_protein || 0), 0) || 0,
    total_carbs:
      meals?.reduce((sum, meal) => sum + (meal.total_carbs || 0), 0) || 0,
    total_fat:
      meals?.reduce((sum, meal) => sum + (meal.total_fat || 0), 0) || 0,
    created_at: new Date().toISOString(),
  }

  return sendApiResponse(progress)
})
