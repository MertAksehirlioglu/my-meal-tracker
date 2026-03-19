/**
 * ISO week utilities — weeks start on Monday.
 * All functions treat dates as local-timezone values (no UTC shifting).
 */

/**
 * Returns the Monday of the ISO week containing `date`.
 * Input can be a Date object or an ISO date string (YYYY-MM-DD).
 */
export function getWeekStart(date: Date | string): Date {
  const d =
    typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date)
  const day = d.getDay() // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Returns the Sunday (end) of the ISO week containing `date`.
 */
export function getWeekEnd(date: Date | string): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Formats a date as YYYY-MM-DD (no timezone conversion).
 */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns the Monday of the current week as a YYYY-MM-DD string.
 */
export function currentWeekStart(): string {
  return toIsoDate(getWeekStart(new Date()))
}

/**
 * Adds `days` days to a YYYY-MM-DD string and returns the result as YYYY-MM-DD.
 */
export function shiftDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toIsoDate(d)
}

/**
 * Returns an array of 7 YYYY-MM-DD strings for Mon–Sun of the given week start.
 */
export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => shiftDate(weekStart, i))
}

/**
 * Human-readable week range, e.g. "Mar 18 – Mar 24, 2026".
 */
export function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(weekStart + 'T00:00:00')
  end.setDate(end.getDate() + 6)

  const fmt = (d: Date, includeYear: boolean) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(includeYear ? { year: 'numeric' } : {}),
    })

  const sameYear = start.getFullYear() === end.getFullYear()
  return `${fmt(start, false)} – ${fmt(end, sameYear)}`
}

/**
 * Returns true if `weekStart` is the ISO week containing today.
 */
export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === currentWeekStart()
}

/**
 * Validates that a date string is a Monday (required for week_start values).
 */
export function isMonday(isoDate: string): boolean {
  const d = new Date(isoDate + 'T00:00:00')
  return d.getDay() === 1
}

/**
 * Short day label for a YYYY-MM-DD string, e.g. "Mon 18".
 */
export function shortDayLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  const day = d.toLocaleDateString('en-US', { weekday: 'short' })
  const num = d.getDate()
  return `${day} ${num}`
}
