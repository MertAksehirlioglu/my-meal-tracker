import { describe, it, expect } from 'vitest'
import { useFormValidation } from '~/composables/useFormValidation'

describe('useFormValidation', () => {
  const {
    required,
    positive,
    email,
    range,
    minLength,
    maxLength,
    weightRule,
    heightRule,
    ageRule,
    calorieRule,
    proteinRule,
    carbsRule,
    fatRule,
    requiredRule,
    positiveRule,
  } = useFormValidation()

  describe('required', () => {
    it('returns true for truthy values', () => {
      expect(required('hello')).toBe(true)
      expect(required(1)).toBe(true)
      expect(required(true)).toBe(true)
    })

    it('returns an error string for falsy values', () => {
      expect(required('')).toBeTypeOf('string')
      expect(required(null)).toBeTypeOf('string')
      expect(required(undefined)).toBeTypeOf('string')
      expect(required(0)).toBeTypeOf('string')
      expect(required(false)).toBeTypeOf('string')
    })

    it('requiredRule is an alias for required', () => {
      expect(requiredRule).toBe(required)
    })
  })

  describe('positive', () => {
    it('returns true for zero', () => {
      expect(positive(0)).toBe(true)
    })

    it('returns true for positive numbers', () => {
      expect(positive(5)).toBe(true)
      expect(positive('10')).toBe(true)
    })

    it('returns true for empty/null/undefined (optional field)', () => {
      expect(positive(null)).toBe(true)
      expect(positive(undefined)).toBe(true)
      expect(positive('')).toBe(true)
    })

    it('returns an error string for negative numbers', () => {
      expect(positive(-1)).toBeTypeOf('string')
      expect(positive('-5')).toBeTypeOf('string')
    })

    it('returns an error string for NaN strings', () => {
      expect(positive('abc')).toBeTypeOf('string')
    })

    it('positiveRule is an alias for positive', () => {
      expect(positiveRule).toBe(positive)
    })
  })

  describe('email', () => {
    it('returns true for valid emails', () => {
      expect(email('user@example.com')).toBe(true)
      expect(email('a@b.io')).toBe(true)
    })

    it('returns true for empty value (optional field)', () => {
      expect(email('')).toBe(true)
      expect(email(null)).toBe(true)
      expect(email(undefined)).toBe(true)
    })

    it('returns an error string for invalid emails', () => {
      expect(email('not-valid')).toBeTypeOf('string')
      expect(email('missing@dot')).toBeTypeOf('string')
    })
  })

  describe('range', () => {
    const between10and20 = range(10, 20, 'Value')

    it('returns true for values within range', () => {
      expect(between10and20(10)).toBe(true)
      expect(between10and20(15)).toBe(true)
      expect(between10and20(20)).toBe(true)
    })

    it('returns true for empty/falsy values (optional field)', () => {
      expect(between10and20(null)).toBe(true)
      expect(between10and20(undefined)).toBe(true)
      expect(between10and20('')).toBe(true)
    })

    it('returns an error string for out-of-range values', () => {
      expect(between10and20(9)).toBeTypeOf('string')
      expect(between10and20(21)).toBeTypeOf('string')
    })
  })

  describe('minLength', () => {
    const atLeast5 = minLength(5)

    it('returns true for strings meeting the minimum', () => {
      expect(atLeast5('hello')).toBe(true)
      expect(atLeast5('hello world')).toBe(true)
    })

    it('returns true for empty/falsy values (optional field)', () => {
      expect(atLeast5(null)).toBe(true)
      expect(atLeast5('')).toBe(true)
    })

    it('returns an error string for strings shorter than minimum', () => {
      expect(atLeast5('hi')).toBeTypeOf('string')
    })
  })

  describe('maxLength', () => {
    const atMost5 = maxLength(5)

    it('returns true for strings at or under maximum', () => {
      expect(atMost5('hi')).toBe(true)
      expect(atMost5('hello')).toBe(true)
    })

    it('returns true for empty/falsy values (optional field)', () => {
      expect(atMost5(null)).toBe(true)
      expect(atMost5('')).toBe(true)
    })

    it('returns an error string for strings exceeding maximum', () => {
      expect(atMost5('toolong')).toBeTypeOf('string')
    })
  })

  describe('domain-specific rules', () => {
    it('weightRule rejects values below 30', () => {
      expect(weightRule(29)).toBeTypeOf('string')
    })

    it('weightRule rejects values above 300', () => {
      expect(weightRule(301)).toBeTypeOf('string')
    })

    it('weightRule accepts 70', () => {
      expect(weightRule(70)).toBe(true)
    })

    it('heightRule accepts 175', () => {
      expect(heightRule(175)).toBe(true)
    })

    it('ageRule accepts 25', () => {
      expect(ageRule(25)).toBe(true)
    })

    it('calorieRule accepts 2000', () => {
      expect(calorieRule(2000)).toBe(true)
    })

    it('proteinRule accepts 150', () => {
      expect(proteinRule(150)).toBe(true)
    })

    it('carbsRule accepts 250', () => {
      expect(carbsRule(250)).toBe(true)
    })

    it('fatRule accepts 80', () => {
      expect(fatRule(80)).toBe(true)
    })
  })
})
