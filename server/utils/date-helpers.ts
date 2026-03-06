export interface DailyTotal {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  meal_count: number
}

/**
 * Returns the start and end of the current day as Date objects.
 * Uses local time so that "today" matches the server's timezone.
 */
export function getTodayRange(): { startOfDay: Date; endOfDay: Date } {
  const today = new Date()
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  )
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  )
  return { startOfDay, endOfDay }
}

/**
 * Returns the start of N days ago (inclusive) as a Date object.
 * Default is 7 days (for weekly range).
 */
export function getStartOfDaysAgo(daysAgo = 7): Date {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (daysAgo - 1))
  startDate.setHours(0, 0, 0, 0)
  return startDate
}

/**
 * Returns the start and end of the past N days (inclusive of today).
 * Default is 7 days for weekly range.
 */
export function getDateRangeForDays(daysAgo = 7): {
  startDate: Date
  endDate: Date
} {
  const startDate = getStartOfDaysAgo(daysAgo)
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)
  return { startDate, endDate }
}

/**
 * Builds a Map pre-filled with zero-value DailyTotal entries for the past
 * 7 days (inclusive of today), keyed by 'YYYY-MM-DD' ISO date strings.
 */
export function buildWeeklyDateMap(): Map<string, DailyTotal> {
  const today = new Date()
  const dailyMap = new Map<string, DailyTotal>()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dailyMap.set(key, {
      date: key,
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      meal_count: 0,
    })
  }

  return dailyMap
}
