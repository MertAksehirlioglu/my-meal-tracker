// In production, replace with Redis or a distributed store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
}

/**
 * Applies rate limiting by IP + URL key.
 * Throws 429 when the limit is exceeded within the current window.
 */
export function applyRateLimit(clientIP: string, url?: string) {
  const now = Date.now()
  const key = `${clientIP}:${url}`

  const current = rateLimitStore.get(key)

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    return
  }

  if (current.count >= RATE_LIMIT.maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: { code: 'RATE_LIMIT_EXCEEDED', resetTime: current.resetTime },
    })
  }

  current.count++
}
