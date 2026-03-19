import { describe, it, expect } from 'vitest'
import {
  formatTime,
  formatShortWeekday,
  formatDateLong,
  formatDateWithYear,
  formatDate,
  formatDisplayDate,
  toDateIso,
  toDatetimeLocal,
  shiftDate,
} from '~/lib/date-utils'

describe('formatTime', () => {
  it('returns a time string in h:MM AM/PM format', () => {
    const result = formatTime('2026-03-19T14:30:00')
    expect(result).toMatch(/\d+:\d{2}\s?(AM|PM)/i)
  })
})

describe('formatDateLong', () => {
  it('includes the full weekday, month abbreviation, and day', () => {
    const date = new Date('2026-03-16T12:00:00') // Monday
    const result = formatDateLong(date)
    expect(result).toMatch(/Monday/)
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/16/)
  })
})

describe('toDatetimeLocal', () => {
  it('returns a string in YYYY-MM-DDTHH:MM format', () => {
    const result = toDatetimeLocal()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})

describe('formatShortWeekday', () => {
  it('returns a 2-character weekday abbreviation', () => {
    // 2026-03-16 is a Monday
    const result = formatShortWeekday('2026-03-16')
    expect(result).toHaveLength(2)
    expect(result).toBe('Mo')
  })

  it('returns Su for Sunday', () => {
    // 2026-03-22 is a Sunday
    const result = formatShortWeekday('2026-03-22')
    expect(result).toBe('Su')
  })
})

describe('formatDateWithYear', () => {
  it('formats a date string with month, day, and year', () => {
    const result = formatDateWithYear('2026-03-19')
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/19/)
    expect(result).toMatch(/2026/)
  })
})

describe('formatDate', () => {
  it('is an alias for formatDateWithYear', () => {
    expect(formatDate).toBe(formatDateWithYear)
  })
})

describe('formatDisplayDate', () => {
  it("returns 'Today' when the date matches today's ISO string", () => {
    const today = '2026-03-19'
    expect(formatDisplayDate(today, today)).toBe('Today')
  })

  it("returns 'Yesterday' for the day before today", () => {
    const today = '2026-03-19'
    const yesterday = '2026-03-18'
    expect(formatDisplayDate(yesterday, today)).toBe('Yesterday')
  })

  it('returns a formatted date string for other dates', () => {
    const today = '2026-03-19'
    const result = formatDisplayDate('2026-03-10', today)
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/10/)
  })
})

describe('toDateIso', () => {
  it('returns a YYYY-MM-DD string', () => {
    const date = new Date('2026-03-19T12:00:00')
    const result = toDateIso(date)
    expect(result).toBe('2026-03-19')
  })
})

describe('shiftDate', () => {
  it('shifts a date forward by the given number of days', () => {
    expect(shiftDate('2026-03-19', 1)).toBe('2026-03-20')
    expect(shiftDate('2026-03-19', 7)).toBe('2026-03-26')
  })

  it('shifts a date backward with negative days', () => {
    expect(shiftDate('2026-03-19', -1)).toBe('2026-03-18')
    expect(shiftDate('2026-03-19', -7)).toBe('2026-03-12')
  })

  it('handles month boundaries correctly', () => {
    expect(shiftDate('2026-03-31', 1)).toBe('2026-04-01')
    expect(shiftDate('2026-03-01', -1)).toBe('2026-02-28')
  })
})
