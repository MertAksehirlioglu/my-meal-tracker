const MIDDAY_OFFSET = 'T12:00:00'

export const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

export const formatShortWeekday = (dateStr: string) => {
  const d = new Date(dateStr + MIDDAY_OFFSET)
  return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
}

export const formatDateLong = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

export const formatDateWithYear = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

// Alias for backwards compatibility
export const formatDate = formatDateWithYear

export const formatDisplayDate = (dateStr: string, todayIso: string) => {
  const d = new Date(dateStr + MIDDAY_OFFSET)
  if (dateStr === todayIso) return 'Today'
  const yesterday = new Date(todayIso + MIDDAY_OFFSET)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export const toDateIso = (date: Date) => date.toISOString().split('T')[0]

export const toDatetimeLocal = () => new Date().toISOString().slice(0, 16)

export const shiftDate = (dateStr: string, days: number) => {
  const d = new Date(dateStr + MIDDAY_OFFSET)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
