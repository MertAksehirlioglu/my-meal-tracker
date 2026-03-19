import { describe, it, expect } from 'vitest'
import {
  getWeekStart,
  getWeekEnd,
  toIsoDate,
  shiftDate,
  weekDays,
  formatWeekRange,
  isCurrentWeek,
  isMonday,
  shortDayLabel,
  currentWeekStart,
} from '~/lib/week-utils'

describe('getWeekStart', () => {
  it('returns Monday when given a Wednesday', () => {
    // 2026-03-18 is a Wednesday
    const result = getWeekStart('2026-03-18')
    expect(toIsoDate(result)).toBe('2026-03-16') // Monday
  })

  it('returns the same Monday when given a Monday', () => {
    const result = getWeekStart('2026-03-16')
    expect(toIsoDate(result)).toBe('2026-03-16')
  })

  it('returns the previous Monday when given a Sunday', () => {
    // 2026-03-22 is a Sunday
    const result = getWeekStart('2026-03-22')
    expect(toIsoDate(result)).toBe('2026-03-16')
  })

  it('accepts a Date object', () => {
    const date = new Date('2026-03-18T12:00:00')
    const result = getWeekStart(date)
    expect(toIsoDate(result)).toBe('2026-03-16')
  })
})

describe('getWeekEnd', () => {
  it('returns Sunday when given a Monday', () => {
    const result = getWeekEnd('2026-03-16')
    expect(toIsoDate(result)).toBe('2026-03-22')
  })

  it('spans 6 days after the week start (Mon–Sun same calendar week)', () => {
    const start = getWeekStart('2026-03-18')
    const end = getWeekEnd('2026-03-18')
    // getWeekEnd uses 23:59:59.999 so toIsoDate difference is exactly 6 days
    const startIso = toIsoDate(start)
    const endIso = toIsoDate(end)
    const diffDays =
      (new Date(endIso + 'T00:00:00').getTime() -
        new Date(startIso + 'T00:00:00').getTime()) /
      (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(6)
  })
})

describe('toIsoDate', () => {
  it('formats a Date as YYYY-MM-DD without UTC conversion', () => {
    const d = new Date(2026, 2, 19) // March 19, 2026 local time
    expect(toIsoDate(d)).toBe('2026-03-19')
  })

  it('pads month and day with leading zeros', () => {
    const d = new Date(2026, 0, 5) // Jan 5
    expect(toIsoDate(d)).toBe('2026-01-05')
  })
})

describe('shiftDate', () => {
  it('adds positive days', () => {
    expect(shiftDate('2026-03-16', 7)).toBe('2026-03-23')
  })

  it('subtracts days with negative input', () => {
    expect(shiftDate('2026-03-16', -7)).toBe('2026-03-09')
  })

  it('handles month boundaries', () => {
    expect(shiftDate('2026-03-31', 1)).toBe('2026-04-01')
    expect(shiftDate('2026-04-01', -1)).toBe('2026-03-31')
  })
})

describe('weekDays', () => {
  it('returns 7 days starting from the given Monday', () => {
    const days = weekDays('2026-03-16')
    expect(days).toHaveLength(7)
    expect(days[0]).toBe('2026-03-16') // Mon
    expect(days[6]).toBe('2026-03-22') // Sun
  })

  it('returns consecutive days', () => {
    const days = weekDays('2026-03-16')
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1] + 'T00:00:00')
      const curr = new Date(days[i] + 'T00:00:00')
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      expect(diff).toBe(1)
    }
  })
})

describe('formatWeekRange', () => {
  it('includes the start and end month and day', () => {
    const result = formatWeekRange('2026-03-16')
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/16/)
    expect(result).toMatch(/22/)
  })

  it('includes the year', () => {
    const result = formatWeekRange('2026-03-16')
    expect(result).toMatch(/2026/)
  })

  it('separates start and end with an em dash', () => {
    const result = formatWeekRange('2026-03-16')
    expect(result).toContain('–')
  })
})

describe('isCurrentWeek', () => {
  it('returns true for the current week start', () => {
    const current = currentWeekStart()
    expect(isCurrentWeek(current)).toBe(true)
  })

  it('returns false for a past week', () => {
    expect(isCurrentWeek('2020-01-06')).toBe(false)
  })

  it('returns false for a future week', () => {
    expect(isCurrentWeek('2030-01-07')).toBe(false)
  })
})

describe('isMonday', () => {
  it('returns true for a Monday', () => {
    expect(isMonday('2026-03-16')).toBe(true)
  })

  it('returns false for a Tuesday', () => {
    expect(isMonday('2026-03-17')).toBe(false)
  })

  it('returns false for a Sunday', () => {
    expect(isMonday('2026-03-22')).toBe(false)
  })
})

describe('shortDayLabel', () => {
  it('returns the weekday abbreviation and day number', () => {
    // 2026-03-16 is a Monday
    const label = shortDayLabel('2026-03-16')
    expect(label).toMatch(/Mon/)
    expect(label).toMatch(/16/)
  })

  it('contains a space between weekday and number', () => {
    const label = shortDayLabel('2026-03-16')
    const parts = label.split(' ')
    expect(parts).toHaveLength(2)
    expect(Number(parts[1])).toBe(16)
  })
})

describe('currentWeekStart', () => {
  it('returns a Monday', () => {
    const start = currentWeekStart()
    expect(isMonday(start)).toBe(true)
  })

  it('returns a YYYY-MM-DD string', () => {
    const start = currentWeekStart()
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
