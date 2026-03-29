import { format, parseISO, addDays, isSameDay, subDays } from 'date-fns'

export const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

export const formatShortWeekday = (dateStr: string) =>
  format(parseISO(dateStr), 'EEEEEE')

export const formatDateLong = (date: Date) => format(date, 'EEEE, MMM d')

export const formatDateWithYear = (dateString: string) =>
  format(parseISO(dateString), 'MMM d, yyyy')

// Alias for backwards compatibility
export const formatDate = formatDateWithYear

export const formatDisplayDate = (dateStr: string, todayIso: string) => {
  const d = parseISO(dateStr)
  const today = parseISO(todayIso)
  if (isSameDay(d, today)) return 'Today'
  if (isSameDay(d, subDays(today, 1))) return 'Yesterday'
  return format(d, 'EEE, MMM d')
}

export const toDateIso = (date: Date) => format(date, 'yyyy-MM-dd')

export const toDatetimeLocal = () => format(new Date(), "yyyy-MM-dd'T'HH:mm")

export const shiftDate = (dateStr: string, days: number) =>
  format(addDays(parseISO(dateStr), days), 'yyyy-MM-dd')
