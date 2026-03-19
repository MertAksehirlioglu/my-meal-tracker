import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  isDemoUser,
  isDemoUserFromEvent,
  createDemoBlockedError,
  validateDemoUser,
  getDemoCredentials,
  DEMO_CONFIG,
} from '~/server/utils/demo'
import type { H3Event } from 'h3'

const DEMO_EMAIL = 'demo@example.com'

function makeEvent(user?: unknown): H3Event {
  return { context: { user } } as unknown as H3Event
}

describe('isDemoUser', () => {
  beforeEach(() => {
    process.env.NUXT_PUBLIC_DEMO_EMAIL = DEMO_EMAIL
  })

  afterEach(() => {
    delete process.env.NUXT_PUBLIC_DEMO_EMAIL
  })

  it('returns true when the user email matches the demo email', () => {
    expect(isDemoUser({ id: 'abc', email: DEMO_EMAIL })).toBe(true)
  })

  it('returns false for a different email', () => {
    expect(isDemoUser({ id: 'abc', email: 'other@example.com' })).toBe(false)
  })

  it('throws when NUXT_PUBLIC_DEMO_EMAIL env var is missing', () => {
    delete process.env.NUXT_PUBLIC_DEMO_EMAIL
    expect(() => isDemoUser({ id: 'abc', email: DEMO_EMAIL })).toThrow(
      'NUXT_PUBLIC_DEMO_EMAIL'
    )
  })
})

describe('isDemoUserFromEvent', () => {
  beforeEach(() => {
    process.env.NUXT_PUBLIC_DEMO_EMAIL = DEMO_EMAIL
  })

  afterEach(() => {
    delete process.env.NUXT_PUBLIC_DEMO_EMAIL
  })

  it('returns true for a demo user event', () => {
    const event = makeEvent({ id: 'abc', email: DEMO_EMAIL })
    expect(isDemoUserFromEvent(event)).toBe(true)
  })

  it('returns false for a non-demo user event', () => {
    const event = makeEvent({ id: 'abc', email: 'other@example.com' })
    expect(isDemoUserFromEvent(event)).toBe(false)
  })

  it('returns false when there is no user on the event', () => {
    const event = makeEvent(undefined)
    expect(isDemoUserFromEvent(event)).toBe(false)
  })
})

describe('createDemoBlockedError', () => {
  it('returns an error object with statusCode 403', () => {
    const err = createDemoBlockedError() as { statusCode?: number }
    expect(err.statusCode).toBe(403)
  })

  it('includes the operation name in the error message when provided', () => {
    const err = createDemoBlockedError('meal creation') as {
      statusMessage?: string
    }
    expect(err.statusMessage).toContain('meal creation')
  })

  it('uses a default operation name when none is provided', () => {
    const err = createDemoBlockedError() as { statusMessage?: string }
    expect(err.statusMessage).toContain('operation')
  })

  it('sets isDemoRestriction flag in data', () => {
    const err = createDemoBlockedError() as {
      data?: { isDemoRestriction?: boolean }
    }
    expect(err.data?.isDemoRestriction).toBe(true)
  })
})

describe('validateDemoUser', () => {
  beforeEach(() => {
    process.env.NUXT_PUBLIC_DEMO_EMAIL = DEMO_EMAIL
  })

  afterEach(() => {
    delete process.env.NUXT_PUBLIC_DEMO_EMAIL
  })

  it('returns true for a valid demo user with matching email and id', () => {
    expect(validateDemoUser({ id: 'abc', email: DEMO_EMAIL })).toBe(true)
  })

  it('returns false when the email does not match', () => {
    expect(validateDemoUser({ id: 'abc', email: 'other@example.com' })).toBe(
      false
    )
  })
})

describe('getDemoCredentials', () => {
  afterEach(() => {
    delete process.env.NUXT_PUBLIC_DEMO_EMAIL
    delete process.env.DEMO_PASSWORD
  })

  it('returns email and password when env vars are set', () => {
    process.env.NUXT_PUBLIC_DEMO_EMAIL = DEMO_EMAIL
    process.env.DEMO_PASSWORD = 'secret123'
    const creds = getDemoCredentials()
    expect(creds.email).toBe(DEMO_EMAIL)
    expect(creds.password).toBe('secret123')
  })

  it('throws when DEMO_PASSWORD is missing', () => {
    process.env.NUXT_PUBLIC_DEMO_EMAIL = DEMO_EMAIL
    delete process.env.DEMO_PASSWORD
    expect(() => getDemoCredentials()).toThrow('DEMO_PASSWORD')
  })
})

describe('DEMO_CONFIG', () => {
  beforeEach(() => {
    process.env.NUXT_PUBLIC_DEMO_EMAIL = DEMO_EMAIL
  })

  afterEach(() => {
    delete process.env.NUXT_PUBLIC_DEMO_EMAIL
  })

  it('EMAIL getter returns the demo email from env', () => {
    expect(DEMO_CONFIG.EMAIL).toBe(DEMO_EMAIL)
  })

  it('RESTRICTIONS flags are all true', () => {
    expect(DEMO_CONFIG.RESTRICTIONS.NO_PROFILE_UPDATES).toBe(true)
    expect(DEMO_CONFIG.RESTRICTIONS.NO_MEAL_CREATION).toBe(true)
    expect(DEMO_CONFIG.RESTRICTIONS.NO_GOAL_UPDATES).toBe(true)
    expect(DEMO_CONFIG.RESTRICTIONS.NO_FILE_UPLOADS).toBe(true)
    expect(DEMO_CONFIG.RESTRICTIONS.NO_DATA_DELETION).toBe(true)
  })

  it('SESSION has expected timeout and concurrent limits', () => {
    expect(DEMO_CONFIG.SESSION.TIMEOUT_HOURS).toBe(4)
    expect(DEMO_CONFIG.SESSION.MAX_CONCURRENT).toBe(10)
  })
})
