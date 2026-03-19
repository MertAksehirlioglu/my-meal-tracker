import { describe, it, expect } from 'vitest'
import { requireAuth, validateInput, validators } from '~/server/utils/auth'
import type { H3Event } from 'h3'

function makeEvent(user?: unknown): H3Event {
  return { context: { user } } as unknown as H3Event
}

describe('requireAuth', () => {
  it('returns the user when authenticated', () => {
    const event = makeEvent({ id: 'user-123', email: 'test@example.com' })
    const result = requireAuth(event)
    expect(result.id).toBe('user-123')
    expect(result.email).toBe('test@example.com')
  })

  it('throws 401 when there is no user', () => {
    const event = makeEvent(undefined)
    expect(() => requireAuth(event)).toThrow()
    try {
      requireAuth(event)
    } catch (err: unknown) {
      expect((err as { statusCode?: number }).statusCode).toBe(401)
    }
  })

  it('throws 401 when user has no id', () => {
    const event = makeEvent({ email: 'test@example.com' })
    expect(() => requireAuth(event)).toThrow()
  })
})

describe('validateInput', () => {
  it('passes when all required fields are present', () => {
    expect(() =>
      validateInput({ name: 'Alice', age: 30 }, ['name', 'age'])
    ).not.toThrow()
  })

  it('throws 400 when a required field is missing', () => {
    try {
      validateInput({ name: 'Alice' }, ['name', 'age'])
    } catch (err: unknown) {
      expect((err as { statusCode?: number }).statusCode).toBe(400)
    }
  })

  it('throws 400 when a required field is null', () => {
    try {
      validateInput({ name: null }, ['name'])
    } catch (err: unknown) {
      expect((err as { statusCode?: number }).statusCode).toBe(400)
    }
  })

  it('throws 400 when a required field is empty string', () => {
    try {
      validateInput({ name: '' }, ['name'])
    } catch (err: unknown) {
      expect((err as { statusCode?: number }).statusCode).toBe(400)
    }
  })

  it('passes optional field validation when field is absent', () => {
    expect(() =>
      validateInput({ name: 'Alice' }, ['name'], {
        age: validators.isNumber,
      })
    ).not.toThrow()
  })

  it('passes optional field validation when field is valid', () => {
    expect(() =>
      validateInput({ name: 'Alice', age: 30 }, ['name'], {
        age: validators.isNumber,
      })
    ).not.toThrow()
  })

  it('throws 400 when an optional field has an invalid value', () => {
    try {
      validateInput({ name: 'Alice', age: 'not-a-number' }, ['name'], {
        age: validators.isNumber,
      })
    } catch (err: unknown) {
      expect((err as { statusCode?: number }).statusCode).toBe(400)
    }
  })
})

describe('validators', () => {
  describe('isNumber', () => {
    it('returns true for valid numbers', () => {
      expect(validators.isNumber(0)).toBe(true)
      expect(validators.isNumber(42)).toBe(true)
      expect(validators.isNumber(-1.5)).toBe(true)
    })

    it('returns false for non-numbers', () => {
      expect(validators.isNumber('42')).toBe(false)
      expect(validators.isNumber(NaN)).toBe(false)
      expect(validators.isNumber(null)).toBe(false)
      expect(validators.isNumber(undefined)).toBe(false)
    })
  })

  describe('isString', () => {
    it('returns true for non-empty strings', () => {
      expect(validators.isString('hello')).toBe(true)
      expect(validators.isString(' ')).toBe(true)
    })

    it('returns false for empty string', () => {
      expect(validators.isString('')).toBe(false)
    })

    it('returns false for non-strings', () => {
      expect(validators.isString(42)).toBe(false)
      expect(validators.isString(null)).toBe(false)
    })
  })

  describe('isEmail', () => {
    it('returns true for valid emails', () => {
      expect(validators.isEmail('user@example.com')).toBe(true)
      expect(validators.isEmail('a@b.co')).toBe(true)
    })

    it('returns false for invalid emails', () => {
      expect(validators.isEmail('not-an-email')).toBe(false)
      expect(validators.isEmail('@domain.com')).toBe(false)
      expect(validators.isEmail('user@')).toBe(false)
      expect(validators.isEmail('')).toBe(false)
    })

    it('returns false for non-strings', () => {
      expect(validators.isEmail(123)).toBe(false)
    })
  })

  describe('isUrl', () => {
    it('returns true for http/https URLs', () => {
      expect(validators.isUrl('http://example.com')).toBe(true)
      expect(validators.isUrl('https://example.com/path')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
      expect(validators.isUrl('ftp://example.com')).toBe(false)
      expect(validators.isUrl('example.com')).toBe(false)
      expect(validators.isUrl('')).toBe(false)
    })
  })

  describe('isConfidence', () => {
    it('returns true for values between 0 and 1 inclusive', () => {
      expect(validators.isConfidence(0)).toBe(true)
      expect(validators.isConfidence(0.5)).toBe(true)
      expect(validators.isConfidence(1)).toBe(true)
    })

    it('returns false for values outside [0, 1]', () => {
      expect(validators.isConfidence(-0.1)).toBe(false)
      expect(validators.isConfidence(1.1)).toBe(false)
    })

    it('returns false for non-numbers', () => {
      expect(validators.isConfidence('0.5')).toBe(false)
    })
  })

  describe('isDateString', () => {
    it('returns true for valid date strings', () => {
      expect(validators.isDateString('2026-03-19')).toBe(true)
      expect(validators.isDateString('2026-03-19T12:00:00Z')).toBe(true)
    })

    it('returns false for invalid date strings', () => {
      expect(validators.isDateString('not-a-date')).toBe(false)
      expect(validators.isDateString('')).toBe(false)
    })

    it('returns false for non-strings', () => {
      expect(validators.isDateString(20260319)).toBe(false)
    })
  })

  describe('isMealType', () => {
    it('returns true for valid meal types', () => {
      expect(validators.isMealType('breakfast')).toBe(true)
      expect(validators.isMealType('lunch')).toBe(true)
      expect(validators.isMealType('dinner')).toBe(true)
      expect(validators.isMealType('snack')).toBe(true)
    })

    it('returns false for invalid meal types', () => {
      expect(validators.isMealType('brunch')).toBe(false)
      expect(validators.isMealType('Breakfast')).toBe(false)
      expect(validators.isMealType('')).toBe(false)
    })

    it('returns false for non-strings', () => {
      expect(validators.isMealType(null)).toBe(false)
    })
  })
})
