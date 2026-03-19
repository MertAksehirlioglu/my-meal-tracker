import { describe, it, expect } from 'vitest'
import { useWeekNavigation } from '~/composables/useWeekNavigation'
import { isMonday, isCurrentWeek, shiftDate } from '~/lib/week-utils'

describe('useWeekNavigation', () => {
  it('initialises weekStart to the current week Monday', () => {
    const { weekStart } = useWeekNavigation()
    expect(isMonday(weekStart.value)).toBe(true)
    expect(isCurrentWeek(weekStart.value)).toBe(true)
  })

  it('goToPrevWeek moves weekStart back 7 days', () => {
    const { weekStart, goToPrevWeek } = useWeekNavigation()
    const original = weekStart.value
    goToPrevWeek()
    expect(weekStart.value).toBe(shiftDate(original, -7))
  })

  it('goToNextWeek moves weekStart forward 7 days', () => {
    const { weekStart, goToNextWeek } = useWeekNavigation()
    const original = weekStart.value
    goToNextWeek()
    expect(weekStart.value).toBe(shiftDate(original, 7))
  })

  it('goToCurrentWeek resets weekStart to the current week', () => {
    const { weekStart, goToPrevWeek, goToCurrentWeek } = useWeekNavigation()
    const currentWeek = weekStart.value
    goToPrevWeek()
    goToPrevWeek()
    expect(weekStart.value).not.toBe(currentWeek)
    goToCurrentWeek()
    expect(weekStart.value).toBe(currentWeek)
  })

  it('isThisWeek is true on initialisation', () => {
    const { isThisWeek } = useWeekNavigation()
    expect(isThisWeek.value).toBe(true)
  })

  it('isThisWeek becomes false after navigating away', () => {
    const { isThisWeek, goToPrevWeek } = useWeekNavigation()
    goToPrevWeek()
    expect(isThisWeek.value).toBe(false)
  })

  it('isThisWeek returns to true after goToCurrentWeek', () => {
    const { isThisWeek, goToPrevWeek, goToCurrentWeek } = useWeekNavigation()
    goToPrevWeek()
    goToCurrentWeek()
    expect(isThisWeek.value).toBe(true)
  })

  it('weekLabel is a non-empty string', () => {
    const { weekLabel } = useWeekNavigation()
    expect(weekLabel.value).toBeTypeOf('string')
    expect(weekLabel.value.length).toBeGreaterThan(0)
  })

  it('weekLabel updates when the week changes', () => {
    const { weekLabel, goToPrevWeek } = useWeekNavigation()
    const labelBefore = weekLabel.value
    goToPrevWeek()
    expect(weekLabel.value).not.toBe(labelBefore)
  })
})
