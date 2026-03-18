/**
 * Server-side demo login endpoint.
 *
 * Performs the Supabase signInWithPassword call on the server so the demo
 * password never needs to be shipped to the browser. The client receives
 * only the session tokens — identical to what Supabase would return directly.
 */
import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, createError, getRequestIP, setResponseHeader } from 'h3'

// Stricter rate limit for demo login: 5 requests per minute per IP
const DEMO_LIMIT = 5
const DEMO_WINDOW_MS = 60 * 1000
const demoRateLimitStore = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler(async (_event) => {
  // Apply rate limiting before any auth logic
  const now = Date.now()
  const ip = getRequestIP(_event) ?? 'unknown'
  const key = `demo:${ip}`
  const existing = demoRateLimitStore.get(key)

  if (!existing || now > existing.resetAt) {
    demoRateLimitStore.set(key, { count: 1, resetAt: now + DEMO_WINDOW_MS })
  } else if (existing.count >= DEMO_LIMIT) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000)
    setResponseHeader(_event, 'Retry-After', retryAfterSeconds)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many demo login attempts, please try again later',
      data: { code: 'RATE_LIMIT_EXCEEDED', resetAt: existing.resetAt },
    })
  } else {
    demoRateLimitStore.set(key, { count: existing.count + 1, resetAt: existing.resetAt })
  }

  const config = useRuntimeConfig()

  const signupDisabled = config.public.signupDisabled as boolean | undefined
  if (!signupDisabled) {
    // Demo login is only meaningful when signup is disabled (portfolio/demo mode)
    throw createError({
      statusCode: 403,
      statusMessage: 'Demo login is not available',
      data: { code: 'DEMO_NOT_ENABLED' },
    })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY
  const demoEmail = process.env.NUXT_PUBLIC_DEMO_EMAIL
  // Demo password is server-only — NOT exposed in runtimeConfig.public
  const demoPassword = process.env.DEMO_PASSWORD

  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error',
    })
  }

  if (!demoEmail || !demoPassword) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Demo account is not configured',
      data: { code: 'DEMO_NOT_CONFIGURED' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  })

  if (error || !data.session) {
    console.error('[DEMO_LOGIN] Supabase sign-in failed:', error?.message)
    throw createError({
      statusCode: 401,
      statusMessage: 'Demo login failed',
      data: { code: 'DEMO_LOGIN_FAILED' },
    })
  }

  return {
    success: true,
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
      },
    },
  }
})
