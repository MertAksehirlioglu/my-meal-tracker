/**
 * Server-side rate limiting middleware
 * Limits each IP to 60 requests per minute.
 *
 * Uses Nuxt's useStorage('cache:') driver so rate-limit state persists across
 * server restarts in development (stored on disk via unstorage's fs driver).
 *
 * Production swap: configure a Redis driver in nuxt.config.ts under nitro.storage:
 *
 *   nitro: {
 *     storage: {
 *       cache: {
 *         driver: 'redis',
 *         url: process.env.REDIS_URL,
 *       },
 *     },
 *   },
 *
 * No extra npm dependencies needed for development — the built-in 'cache:'
 * driver is provided by Nuxt/Nitro out of the box.
 */
import { defineEventHandler, getRequestIP, setResponseStatus } from 'h3'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const LIMIT = 60
const WINDOW_MS = 60 * 1000 // 1 minute
const TTL_SECONDS = 60 // Storage TTL aligns with the rate-limit window

export default defineEventHandler(async (event) => {
  const now = Date.now()
  const ip = getRequestIP(event) ?? 'unknown'
  const storageKey = `rateLimit:${ip}`

  const storage = useStorage('cache:')

  const existing = await storage.getItem<RateLimitEntry>(storageKey)

  if (!existing || now > existing.resetAt) {
    // Start a new window
    await storage.setItem<RateLimitEntry>(
      storageKey,
      { count: 1, resetAt: now + WINDOW_MS },
      { ttl: TTL_SECONDS },
    )
    return
  }

  if (existing.count >= LIMIT) {
    setResponseStatus(event, 429)
    return { error: 'Too many requests, please try again later' }
  }

  await storage.setItem<RateLimitEntry>(
    storageKey,
    { count: existing.count + 1, resetAt: existing.resetAt },
    { ttl: TTL_SECONDS },
  )
})
