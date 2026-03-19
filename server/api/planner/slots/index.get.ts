import type { MealPlanSlot } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getDemoPlannerSlots } from '~/server/utils/demo-data'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'
import { isMonday, shiftDate } from '~/lib/week-utils'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const weekStart = typeof query.week_start === 'string' ? query.week_start : ''

  if (!weekStart || !isMonday(weekStart)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'week_start query param is required and must be a Monday (YYYY-MM-DD)',
    })
  }

  if (isDemoUser(user)) {
    return { success: true, data: getDemoPlannerSlots(user.id, weekStart) }
  }

  const weekEnd = shiftDate(weekStart, 6)
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('meal_plan_slots')
    .select(
      `
      *,
      inventory:meal_inventory(
        *,
        template:meal_templates(*)
      )
    `
    )
    .eq('user_id', user.id)
    .gte('planned_date', weekStart)
    .lte('planned_date', weekEnd)
    .order('planned_date', { ascending: true })
    .order('meal_type', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch slots',
    })
  }

  return { success: true, data: data as MealPlanSlot[] }
})
