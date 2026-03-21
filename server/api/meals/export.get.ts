import type { Meal } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'
import { getDemoMealsByDate } from '~/server/utils/demo-data'

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function mealsToCsv(meals: Meal[]): string {
  const headers = [
    'name',
    'meal_type',
    'consumed_at',
    'calories',
    'protein',
    'carbs',
    'fat',
    'notes',
  ]
  const rows = meals.map((m) => [
    escapeCsvField(m.name),
    escapeCsvField(m.meal_type),
    escapeCsvField(m.consumed_at),
    escapeCsvField(m.total_calories),
    escapeCsvField(m.total_protein),
    escapeCsvField(m.total_carbs),
    escapeCsvField(m.total_fat),
    escapeCsvField(m.notes),
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)

  const query = getQuery(event)
  const startDate = query.startDate as string | undefined
  const endDate = query.endDate as string | undefined

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'startDate and endDate query params are required',
    })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid date format. Use YYYY-MM-DD.',
    })
  }

  if (end < start) {
    throw createError({
      statusCode: 400,
      statusMessage: 'endDate must be on or after startDate',
    })
  }

  let meals: Meal[] = []

  if (isDemoUser(user)) {
    // Collect demo meals for each day in range
    const current = new Date(start)
    while (current <= end) {
      const dayMeals = await getDemoMealsByDate(user.id, new Date(current))
      meals.push(...dayMeals)
      current.setDate(current.getDate() + 1)
    }
  } else {
    const startOfRange = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0,
      0,
      0,
      0
    )
    const endOfRange = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
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
      .gte('consumed_at', startOfRange.toISOString())
      .lte('consumed_at', endOfRange.toISOString())
      .order('consumed_at', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch meals for export',
      })
    }

    meals = data as Meal[]
  }

  if (meals.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No meals found in the specified date range',
    })
  }

  const csv = mealsToCsv(meals)
  const filename = `meals-${startDate}-to-${endDate}.csv`

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

  return csv
})
