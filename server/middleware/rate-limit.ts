/**
 * Server-side rate limiting middleware
 * Limits each IP to 60 requests per minute using in-memory storage.
 *
 * For production with multiple instances, swap the in-memory Map for a
 * Redis-backed store by replacing the Map operations with ioredis calls.
 */
import {
  defineEventHandler,
  getRequestIP,
  createError,
  setResponseHeader,
} from 'h3'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const LIMIT = 60
const WINDOW_MS = 60 * 1000 // 1 minute

const rateLimitStore = new Map<string, RateLimitEntry>()

export default defineEventHandler(async (event) => {
  const now = Date.now()
  const ip = getRequestIP(event) ?? 'unknown'
  const storageKey = `rateLimit:${ip}`

  const existing = rateLimitStore.get(storageKey)

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(storageKey, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  if (existing.count >= LIMIT) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000)
    setResponseHeader(event, 'Retry-After', retryAfterSeconds)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests, please try again later',
      data: { code: 'RATE_LIMIT_EXCEEDED', resetAt: existing.resetAt },
    })
  }

  rateLimitStore.set(storageKey, {
    count: existing.count + 1,
    resetAt: existing.resetAt,
  })
})
