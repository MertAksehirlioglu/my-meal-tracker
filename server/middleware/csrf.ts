/**
 * CSRF protection middleware for mutation API endpoints.
 *
 * For POST, PUT, PATCH, DELETE requests to /api/* routes:
 *   - Reads the Origin header (falls back to Referer if absent)
 *   - Compares against the allowed origin from runtimeConfig.public.appUrl
 *     (set via NUXT_PUBLIC_APP_URL env var; falls back to 'http://localhost:3000')
 *   - Throws 403 if Origin is present but does not match
 *   - Allows requests with no Origin header (server-side / curl calls) but logs a warning
 *
 * GET, HEAD, and OPTIONS requests are always skipped — they are safe methods.
 */
import {
  defineEventHandler,
  getRequestHeader,
  getRequestURL,
  createError,
} from 'h3'

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export default defineEventHandler((event) => {
  const method = event.node.req.method?.toUpperCase() ?? ''

  // Only check mutation methods
  if (!MUTATION_METHODS.has(method)) {
    return
  }

  // Only check /api/* routes
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  const config = useRuntimeConfig()
  // NUXT_PUBLIC_APP_URL is exposed via runtimeConfig.public.appUrl
  const allowedOrigin: string =
    (config.public.appUrl as string | undefined) ?? 'http://localhost:3000'

  // Prefer Origin header; fall back to Referer
  const originHeader = getRequestHeader(event, 'origin')
  const refererHeader = getRequestHeader(event, 'referer')

  let requestOrigin: string | undefined
  try {
    requestOrigin =
      originHeader ??
      (refererHeader ? new URL(refererHeader).origin : undefined)
  } catch {
    // Malformed Referer header — treat as missing origin
    requestOrigin = undefined
  }

  if (!requestOrigin) {
    // No Origin / Referer — allow but warn (server-side/curl calls)
    console.warn(
      `[CSRF] No Origin header on ${method} ${url.pathname} — request allowed (server-side or curl call)`
    )
    return
  }

  if (requestOrigin !== allowedOrigin) {
    console.warn(
      `[CSRF] Origin mismatch on ${method} ${url.pathname}: got "${requestOrigin}", expected "${allowedOrigin}"`
    )
    throw createError({
      statusCode: 403,
      statusMessage: 'CSRF validation failed',
      data: { code: 'CSRF_VALIDATION_FAILED' },
    })
  }
})
