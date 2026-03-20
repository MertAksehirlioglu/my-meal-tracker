import type { MealInventory } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getDemoPlannerInventory } from '~/server/utils/demo-data'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'
import { isMonday } from '~/lib/week-utils'

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
    return sendApiResponse(getDemoPlannerInventory(user.id, weekStart))
  }

  const supabase = getSupabaseClient()

  // Fetch inventory with template data and count of slots used
  const { data, error } = await supabase
    .from('meal_inventory')
    .select(
      `
      *,
      template:meal_templates(*),
      meal_plan_slots(id)
    `
    )
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch inventory',
    })
  }

  const inventory: MealInventory[] = (data ?? []).map((row) => {
    const { meal_plan_slots, ...rest } = row as Record<string, unknown> & {
      meal_plan_slots?: unknown[]
    }
    return {
      ...(rest as unknown as MealInventory),
      portions_used: Array.isArray(meal_plan_slots)
        ? meal_plan_slots.length
        : 0,
    }
  })

  return sendApiResponse(inventory)
})
