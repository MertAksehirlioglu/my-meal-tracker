import type { Meal } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  createSuccessResponse,
  createErrorResponse,
  ApiErrorCode,
} from '~/server/utils/api-error'
import { getTodayRange } from '~/server/utils/date-helpers'
import { getDemoMealsForToday } from '~/server/utils/demo-data'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)

  if (isDemoUser(user)) {
    const data = await getDemoMealsForToday(user.id)
    return createSuccessResponse(data, 'Demo meals fetched successfully')
  }

  const supabase = getSupabaseClient()
  const { startOfDay, endOfDay } = getTodayRange()

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('consumed_at', startOfDay.toISOString())
    .lte('consumed_at', endOfDay.toISOString())
    .order('consumed_at', { ascending: false })

  if (error) {
    createErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      'Failed to fetch meals',
      500,
      error.message
    )
  }

  return createSuccessResponse(data as Meal[], 'Meals fetched successfully')
})
