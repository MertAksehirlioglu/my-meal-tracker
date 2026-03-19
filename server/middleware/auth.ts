import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import { applyRateLimit } from '~/server/utils/rate-limit'
import { createMockUser } from '~/server/utils/mock-user'

export default defineEventHandler(async (event) => {
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  event.context.isAuthenticated = false
  event.context.user = null

  const url = event.node.req.url
  const method = event.node.req.method
  const clientIP =
    getRequestIP(event, { xForwardedFor: true }) ||
    event.node.req.socket?.remoteAddress ||
    'unknown'

  const publicEndpoints = [
    '/api/health',
    '/api/public',
    '/api/auth/callback',
    '/api/auth/demo-login',
  ]

  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    url?.startsWith(endpoint)
  )

  if (isPublicEndpoint) {
    applyRateLimit(clientIP, url)
    return
  }

  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  try {
    applyRateLimit(clientIP, url)

    const authHeader = getHeader(event, 'authorization')

    if (!authHeader) {
      if (isDevelopment) {
        console.warn(`[DEV] No authorization header for ${method} ${url}`)
        event.context.user = createMockUser()
        event.context.isAuthenticated = false
        return
      }

      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required',
        data: { code: 'MISSING_AUTH_HEADER' },
      })
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage:
          'Invalid authorization header format. Expected: Bearer <token>',
        data: { code: 'INVALID_AUTH_FORMAT' },
      })
    }

    const token = authHeader.substring(7).trim()

    if (!token || token.length < 10) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token format',
        data: { code: 'INVALID_TOKEN_FORMAT' },
      })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration')
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Token verification timeout')), 5000)
    )

    const result = await Promise.race([
      supabase.auth.getUser(token),
      timeoutPromise,
    ])

    const {
      data: { user },
      error,
    } = result as { data: { user: User | null }; error: Error | null }

    if (error) {
      if (isDevelopment) {
        console.warn(
          `[DEV] Token verification failed for ${url}:`,
          error.message
        )
        event.context.user = createMockUser()
        event.context.isAuthenticated = false
        return
      }

      console.warn(
        `[SECURITY] Invalid token attempt from ${clientIP} for ${method} ${url}`
      )

      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token',
        data: { code: 'TOKEN_VERIFICATION_FAILED' },
      })
    }

    if (!user || !user.id) {
      if (isDevelopment) {
        console.warn(`[DEV] No user found for token in ${url}`)
        event.context.user = createMockUser()
        event.context.isAuthenticated = false
        return
      }

      throw createError({
        statusCode: 401,
        statusMessage: 'User not found',
        data: { code: 'USER_NOT_FOUND' },
      })
    }

    const bannedUntil = user.user_metadata?.banned_until as string | undefined
    if (bannedUntil && new Date(bannedUntil) > new Date()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'User account is temporarily suspended',
        data: { code: 'USER_BANNED' },
      })
    }

    event.context.user = user
    event.context.isAuthenticated = true

    if (isProduction) {
      console.info(`[AUTH] User ${user.id} accessed ${method} ${url}`)
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error(`[AUTH_ERROR] Unexpected error for ${method} ${url}:`, error)

    if (isDevelopment) {
      console.warn(`[DEV] Auth error - allowing request to continue`)
      event.context.user = createMockUser()
      event.context.isAuthenticated = false
      return
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication service error',
      data: { code: 'AUTH_SERVICE_ERROR' },
    })
  }
})
