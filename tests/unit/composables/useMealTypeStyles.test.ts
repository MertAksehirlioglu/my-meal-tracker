import { describe, it, expect } from 'vitest'
import { useMealTypeStyles } from '~/composables/useMealTypeStyles'

describe('useMealTypeStyles', () => {
  const { getMealTypeIcon, getMealTypeColor } = useMealTypeStyles()

  describe('getMealTypeIcon', () => {
    it('returns the sunrise icon for breakfast', () => {
      expect(getMealTypeIcon('breakfast')).toBe('mdi-sunrise')
    })

    it('returns the sunny icon for lunch', () => {
      expect(getMealTypeIcon('lunch')).toBe('mdi-sunny')
    })

    it('returns the moon icon for dinner', () => {
      expect(getMealTypeIcon('dinner')).toBe('mdi-moon-waning-crescent')
    })

    it('returns the food-apple icon for snack', () => {
      expect(getMealTypeIcon('snack')).toBe('mdi-food-apple')
    })

    it('returns the default food icon for unknown meal types', () => {
      expect(getMealTypeIcon('brunch')).toBe('mdi-food')
      expect(getMealTypeIcon('')).toBe('mdi-food')
      expect(getMealTypeIcon('unknown')).toBe('mdi-food')
    })
  })

  describe('getMealTypeColor', () => {
    it('returns orange for breakfast', () => {
      expect(getMealTypeColor('breakfast')).toBe('orange')
    })

    it('returns green for lunch', () => {
      expect(getMealTypeColor('lunch')).toBe('green')
    })

    it('returns purple for dinner', () => {
      expect(getMealTypeColor('dinner')).toBe('purple')
    })

    it('returns blue for snack', () => {
      expect(getMealTypeColor('snack')).toBe('blue')
    })

    it('returns grey for unknown meal types', () => {
      expect(getMealTypeColor('brunch')).toBe('grey')
      expect(getMealTypeColor('')).toBe('grey')
      expect(getMealTypeColor('unknown')).toBe('grey')
    })
  })
})
