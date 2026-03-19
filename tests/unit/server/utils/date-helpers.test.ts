import { describe, it, expect } from 'vitest'
import {
  getTodayRange,
  getStartOfDaysAgo,
  getDateRangeForDays,
  buildWeeklyDateMap,
} from '~/server/utils/date-helpers'

describe('getTodayRange', () => {
  it('returns startOfDay at midnight (00:00:00.000)', () => {
    const { startOfDay } = getTodayRange()
    expect(startOfDay.getHours()).toBe(0)
    expect(startOfDay.getMinutes()).toBe(0)
    expect(startOfDay.getSeconds()).toBe(0)
    expect(startOfDay.getMilliseconds()).toBe(0)
  })

  it('returns endOfDay at end of day (23:59:59.999)', () => {
    const { endOfDay } = getTodayRange()
    expect(endOfDay.getHours()).toBe(23)
    expect(endOfDay.getMinutes()).toBe(59)
    expect(endOfDay.getSeconds()).toBe(59)
    expect(endOfDay.getMilliseconds()).toBe(999)
  })

  it('startOfDay and endOfDay are on the same calendar date', () => {
    const { startOfDay, endOfDay } = getTodayRange()
    expect(startOfDay.getFullYear()).toBe(endOfDay.getFullYear())
    expect(startOfDay.getMonth()).toBe(endOfDay.getMonth())
    expect(startOfDay.getDate()).toBe(endOfDay.getDate())
  })

  it('endOfDay is after startOfDay', () => {
    const { startOfDay, endOfDay } = getTodayRange()
    expect(endOfDay.getTime()).toBeGreaterThan(startOfDay.getTime())
  })
})

describe('getStartOfDaysAgo', () => {
  it('returns a date at midnight', () => {
    const result = getStartOfDaysAgo(7)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('defaults to 7 days ago', () => {
    const today = new Date()
    const result = getStartOfDaysAgo()
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - 6) // daysAgo - 1
    expect(result.getFullYear()).toBe(expectedDate.getFullYear())
    expect(result.getMonth()).toBe(expectedDate.getMonth())
    expect(result.getDate()).toBe(expectedDate.getDate())
  })

  it('returns today when daysAgo is 1', () => {
    const today = new Date()
    const result = getStartOfDaysAgo(1)
    expect(result.getDate()).toBe(today.getDate())
  })
})

describe('getDateRangeForDays', () => {
  it('returns a start date and end date', () => {
    const { startDate, endDate } = getDateRangeForDays(7)
    expect(startDate).toBeInstanceOf(Date)
    expect(endDate).toBeInstanceOf(Date)
  })

  it('endDate is after startDate', () => {
    const { startDate, endDate } = getDateRangeForDays(7)
    expect(endDate.getTime()).toBeGreaterThan(startDate.getTime())
  })

  it('endDate is at end of day', () => {
    const { endDate } = getDateRangeForDays()
    expect(endDate.getHours()).toBe(23)
    expect(endDate.getMinutes()).toBe(59)
    expect(endDate.getSeconds()).toBe(59)
  })

  it('the range spans approximately the given number of days', () => {
    const { startDate, endDate } = getDateRangeForDays(7)
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(6)
    expect(diffDays).toBeLessThan(7)
  })
})

describe('buildWeeklyDateMap', () => {
  it('returns a Map with 7 entries', () => {
    const map = buildWeeklyDateMap()
    expect(map.size).toBe(7)
  })

  it('all keys are YYYY-MM-DD formatted strings', () => {
    const map = buildWeeklyDateMap()
    for (const key of map.keys()) {
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('includes today as a key', () => {
    const today = new Date().toISOString().split('T')[0]
    const map = buildWeeklyDateMap()
    expect(map.has(today)).toBe(true)
  })

  it('each entry has all zero-valued macro fields', () => {
    const map = buildWeeklyDateMap()
    for (const entry of map.values()) {
      expect(entry.total_calories).toBe(0)
      expect(entry.total_protein).toBe(0)
      expect(entry.total_carbs).toBe(0)
      expect(entry.total_fat).toBe(0)
      expect(entry.meal_count).toBe(0)
    }
  })

  it('the 7 keys are consecutive dates ending with today', () => {
    const today = new Date().toISOString().split('T')[0]
    const map = buildWeeklyDateMap()
    const keys = [...map.keys()].sort()
    expect(keys[keys.length - 1]).toBe(today)
  })
})
