import { describe, it, expect } from 'vitest'
import {
  nutritionDatabase,
  mapToFoodItem,
  estimateNutrition,
} from '~/lib/nutrition-database'

describe('nutritionDatabase', () => {
  it('contains nutrition info for common foods', () => {
    expect(nutritionDatabase['pizza']).toBeDefined()
    expect(nutritionDatabase['chicken']).toBeDefined()
    expect(nutritionDatabase['rice']).toBeDefined()
    expect(nutritionDatabase['apple']).toBeDefined()
  })

  it('each entry has required macro fields', () => {
    for (const [, info] of Object.entries(nutritionDatabase)) {
      expect(info).toHaveProperty('calories')
      expect(info).toHaveProperty('protein')
      expect(info).toHaveProperty('carbs')
      expect(info).toHaveProperty('fat')
      expect(info).toHaveProperty('fiber')
    }
  })

  it('all nutrition values are non-negative numbers', () => {
    for (const [, info] of Object.entries(nutritionDatabase)) {
      expect(info.calories).toBeGreaterThanOrEqual(0)
      expect(info.protein).toBeGreaterThanOrEqual(0)
      expect(info.carbs).toBeGreaterThanOrEqual(0)
      expect(info.fat).toBeGreaterThanOrEqual(0)
      expect(info.fiber).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('mapToFoodItem', () => {
  it('maps direct food labels correctly', () => {
    expect(mapToFoodItem('pizza')).toBe('pizza')
    expect(mapToFoodItem('hamburger')).toBe('hamburger')
    expect(mapToFoodItem('sandwich')).toBe('sandwich')
    expect(mapToFoodItem('rice')).toBe('rice')
    expect(mapToFoodItem('banana')).toBe('banana')
  })

  it('is case-insensitive', () => {
    expect(mapToFoodItem('PIZZA')).toBe('pizza')
    expect(mapToFoodItem('Pizza')).toBe('pizza')
  })

  it('maps object labels to food items', () => {
    expect(mapToFoodItem('plate')).toBe('mixed meal')
    expect(mapToFoodItem('bowl')).toBe('soup')
    expect(mapToFoodItem('cup')).toBe('beverage')
    expect(mapToFoodItem('dining table')).toBe('mixed meal')
  })

  it('maps hot dog to sandwich', () => {
    expect(mapToFoodItem('hot dog')).toBe('sandwich')
  })

  it('returns mixed meal for unknown labels', () => {
    expect(mapToFoodItem('xyz_unknown_label')).toBe('mixed meal')
    expect(mapToFoodItem('')).toBe('mixed meal')
  })

  it('handles partial matches in labels', () => {
    expect(mapToFoodItem('a plate of food')).toBe('mixed meal')
    expect(mapToFoodItem('large pizza')).toBe('pizza')
  })
})

describe('estimateNutrition', () => {
  it('returns correct nutrition for known food labels', () => {
    const result = estimateNutrition('pizza')
    expect(result.calories).toBe(285)
    expect(result.protein).toBe(12)
  })

  it('returns correct nutrition for mapped labels', () => {
    const result = estimateNutrition('plate')
    expect(result).toEqual(nutritionDatabase['mixed meal'])
  })

  it('falls back to mixed meal nutrition for unmapped labels', () => {
    // mapToFoodItem always returns 'mixed meal' for unknown labels,
    // which is in the database (350 cal, 18 protein, etc.)
    const result = estimateNutrition('completely_unknown_food_xyz')
    expect(result).toEqual(nutritionDatabase['mixed meal'])
  })

  it('all returned values are non-negative numbers', () => {
    const labels = ['pizza', 'chicken', 'salad', 'unknown_xyz']
    for (const label of labels) {
      const result = estimateNutrition(label)
      expect(result.calories).toBeGreaterThanOrEqual(0)
      expect(result.protein).toBeGreaterThanOrEqual(0)
      expect(result.carbs).toBeGreaterThanOrEqual(0)
      expect(result.fat).toBeGreaterThanOrEqual(0)
    }
  })
})
