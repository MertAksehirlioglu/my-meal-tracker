/**
 * Server-side rate limiting middleware
 * Limits each IP to 60 requests per minute.
 */
import { defineEventHandler, getRequestIP, setResponseStatus } from 'h3'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const LIMIT = 60
const WINDOW_MS = 60 * 1000 // 1 minute

export default defineEventHandler((event) => {
  const now = Date.now()

  // Clean up expired entries on each request
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }

  const ip = getRequestIP(event) ?? 'unknown'
  const existing = store.get(ip)

  if (!existing || now > existing.resetAt) {
    // New window
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  if (existing.count >= LIMIT) {
    setResponseStatus(event, 429)
    return { error: 'Too many requests, please try again later' }
  }

  existing.count++
})
