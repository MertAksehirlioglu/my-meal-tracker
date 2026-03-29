/**
 * ISO week utilities — weeks start on Monday.
 * Built on date-fns for timezone-safe date arithmetic.
 */
import { startOfWeek, endOfWeek, addDays, format, parseISO, getDay } from 'date-fns'

const WEEK_OPTIONS = { weekStartsOn: 1 as const }

/**
 * Returns the Monday of the ISO week containing `date`.
 */
export function getWeekStart(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  return startOfWeek(d, WEEK_OPTIONS)
}

/**
 * Returns the Sunday (end) of the ISO week containing `date`.
 */
export function getWeekEnd(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  return endOfWeek(d, WEEK_OPTIONS)
}

/**
 * Formats a date as YYYY-MM-DD.
 */
export function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
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
  return format(addDays(parseISO(isoDate), days), 'yyyy-MM-dd')
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
  const start = parseISO(weekStart)
  const end = addDays(start, 6)
  const startStr = format(start, 'MMM d')
  const sameYear = start.getFullYear() === end.getFullYear()
  const endStr = format(end, sameYear ? 'MMM d, yyyy' : 'MMM d')
  return `${startStr} – ${endStr}`
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
  return getDay(parseISO(isoDate)) === 1
}

/**
 * Short day label for a YYYY-MM-DD string, e.g. "Mon 18".
 */
export function shortDayLabel(isoDate: string): string {
  return format(parseISO(isoDate), 'EEE d')
}
