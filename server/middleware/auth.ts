import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Request rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 100, // requests per window
  windowMs: 15 * 60 * 1000, // 15 minutes
}

export default defineEventHandler(async (event) => {
  // Only apply auth middleware to API routes
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  // Initialize context properties
  event.context.isAuthenticated = false
  event.context.user = null

  const url = event.node.req.url
  const method = event.node.req.method
  const clientIP = getRequestIP(event, { xForwardedFor: true }) || event.node.req.socket?.remoteAddress || 'unknown'

  // Public endpoints that don't require authentication
  const publicEndpoints = [
    '/api/health',
    '/api/public',
    '/api/auth/callback', // Supabase auth callback
  ]

  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    url?.startsWith(endpoint)
  )

  // Skip auth for public endpoints but still apply rate limiting
  if (isPublicEndpoint) {
    applyRateLimit(clientIP, url)
    return
  }

  // Environment-based configuration
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  try {
    // Apply rate limiting for all authenticated endpoints
    applyRateLimit(clientIP, url)

    // Get and validate authorization header
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader) {
      if (isDevelopment) {
        console.warn(`[DEV] No authorization header for ${method} ${url}`)
        // In development, we can bypass auth for testing
        event.context.user = createMockUser()
        event.context.isAuthenticated = false
        return
      }
      
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required',
        data: { code: 'MISSING_AUTH_HEADER' }
      })
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authorization header format. Expected: Bearer <token>',
        data: { code: 'INVALID_AUTH_FORMAT' }
      })
    }

    // Extract and validate token
    const token = authHeader.substring(7).trim()
    
    if (!token || token.length < 10) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token format',
        data: { code: 'INVALID_TOKEN_FORMAT' }
      })
    }

    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration')
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error'
      })
    }

    // Create Supabase client with error handling
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verify JWT token with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Token verification timeout')), 5000)
    )

    const verifyPromise = supabase.auth.getUser(token)
    
    const result = await Promise.race([
      verifyPromise,
      timeoutPromise,
    ])
    
    const { data: { user }, error } = result as { data: { user: User | null }; error: Error | null }

    if (error) {
      if (isDevelopment) {
        console.warn(`[DEV] Token verification failed for ${url}:`, error.message)
        event.context.user = createMockUser()
        event.context.isAuthenticated = false
        return
      }

      // Log security events in production
      console.warn(`[SECURITY] Invalid token attempt from ${clientIP} for ${method} ${url}`)
      
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token',
        data: { code: 'TOKEN_VERIFICATION_FAILED' }
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
        data: { code: 'USER_NOT_FOUND' }
      })
    }

    // Validate user status (example - add banned_until to user_metadata if needed)
    const bannedUntil = user.user_metadata?.banned_until as string | undefined
    if (bannedUntil && new Date(bannedUntil) > new Date()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'User account is temporarily suspended',
        data: { code: 'USER_BANNED' }
      })
    }

    // Add user context with additional security info
    event.context.user = user
    event.context.isAuthenticated = true

    // Log successful auth in production for monitoring
    if (isProduction) {
      console.info(`[AUTH] User ${user.id} accessed ${method} ${url}`)
    }

  } catch (error: unknown) {
    // Handle different error types
    if (error && typeof error === 'object' && 'statusCode' in error) {
      // Re-throw HTTP errors
      throw error
    }

    // Log unexpected errors
    console.error(`[AUTH_ERROR] Unexpected error for ${method} ${url}:`, error)

    if (isDevelopment) {
      console.warn(`[DEV] Auth error - allowing request to continue`)
      event.context.user = createMockUser()
      event.context.isAuthenticated = false
      return
    }

    // Generic error for production
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication service error',
      data: { code: 'AUTH_SERVICE_ERROR' }
    })
  }
})

/**
 * Apply rate limiting to prevent abuse
 */
function applyRateLimit(clientIP: string, url?: string) {
  const now = Date.now()
  const key = `${clientIP}:${url}`
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    })
    return
  }
  
  if (current.count >= RATE_LIMIT.maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: {
        code: 'RATE_LIMIT_EXCEEDED',
        resetTime: current.resetTime,
      }
    })
  }
  
  current.count++
}

/**
 * Create mock user for development
 */
function createMockUser(): User {
  return {
    id: 'dev-user-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'dev@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email' },
    user_metadata: {},
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as User
}
