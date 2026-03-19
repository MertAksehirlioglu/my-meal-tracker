import { describe, it, expect, beforeEach, vi } from 'vitest'

// Import after mocking so the module is fresh
// We need to reset the internal store between tests.
// Since the store is module-level, we re-import via vi.resetModules().

describe('applyRateLimit', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  async function getApplyRateLimit() {
    const mod = await import('~/server/utils/rate-limit')
    return mod.applyRateLimit
  }

  it('allows the first request without throwing', async () => {
    const applyRateLimit = await getApplyRateLimit()
    expect(() => applyRateLimit('1.2.3.4', '/api/health')).not.toThrow()
  })

  it('allows requests up to the limit without throwing', async () => {
    const applyRateLimit = await getApplyRateLimit()
    expect(() => {
      for (let i = 0; i < 100; i++) {
        applyRateLimit('1.2.3.4', '/api/test')
      }
    }).not.toThrow()
  })

  it('throws 429 when requests exceed the limit within the window', async () => {
    const applyRateLimit = await getApplyRateLimit()
    // Exhaust the limit
    for (let i = 0; i < 100; i++) {
      applyRateLimit('5.5.5.5', '/api/limited')
    }
    // 101st request should throw
    expect(() => applyRateLimit('5.5.5.5', '/api/limited')).toThrow()
    try {
      applyRateLimit('5.5.5.5', '/api/limited')
    } catch (err: unknown) {
      expect((err as { statusCode?: number }).statusCode).toBe(429)
    }
  })

  it('tracks limits per unique IP+URL combination', async () => {
    const applyRateLimit = await getApplyRateLimit()
    // Exhaust limit for one client
    for (let i = 0; i < 100; i++) {
      applyRateLimit('7.7.7.7', '/api/meals')
    }
    // Different IP should still be allowed
    expect(() => applyRateLimit('8.8.8.8', '/api/meals')).not.toThrow()
    // Same IP but different URL should still be allowed
    expect(() => applyRateLimit('7.7.7.7', '/api/goals')).not.toThrow()
  })

  it('resets the count after the time window expires', async () => {
    vi.useFakeTimers()
    const applyRateLimit = await getApplyRateLimit()

    for (let i = 0; i < 100; i++) {
      applyRateLimit('9.9.9.9', '/api/reset')
    }
    // Advance time past the 15-minute window
    vi.advanceTimersByTime(15 * 60 * 1000 + 1)
    // Should be allowed again
    expect(() => applyRateLimit('9.9.9.9', '/api/reset')).not.toThrow()
    vi.useRealTimers()
  })
})
