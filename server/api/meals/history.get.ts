import type { Meal } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'
import { getDemoMealsByDate } from '~/server/utils/demo-data'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)

  const query = getQuery(event)
  const dateParam = query.date as string | undefined
  const targetDate = dateParam ? new Date(dateParam) : new Date()

  if (isNaN(targetDate.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid date parameter',
    })
  }

  if (isDemoUser(user)) {
    return sendApiResponse({
      meals: await getDemoMealsByDate(user.id, targetDate),
      date: targetDate.toISOString().split('T')[0],
    })
  }

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

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('consumed_at', startOfDay.toISOString())
    .lte('consumed_at', endOfDay.toISOString())
    .order('consumed_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch meals',
    })
  }

  return sendApiResponse({
    meals: data as Meal[],
    date: targetDate.toISOString().split('T')[0],
  })
})
