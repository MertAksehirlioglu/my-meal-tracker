/**
 * Security headers middleware.
 *
 * Applies security-relevant HTTP response headers to every request.
 * Runs before route handlers so that all responses include these headers.
 */
import { defineEventHandler, setResponseHeaders } from 'h3'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    // Prevent browsers from MIME-sniffing content types
    'X-Content-Type-Options': 'nosniff',
    // Block the page from being embedded in frames (clickjacking protection)
    'X-Frame-Options': 'DENY',
    // Enable the browser's XSS filter (legacy but harmless)
    'X-XSS-Protection': '1; mode=block',
    // Only send the origin in the Referer header for cross-origin requests
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Allow camera (for food snap) and deny everything else by default
    'Permissions-Policy': 'camera=self, microphone=(), geolocation=()',
    // Content Security Policy
    // 'unsafe-inline' is required for Vuetify's runtime style injection.
    // Remove it if you can configure a nonce-based CSP in the future.
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://tfhub.dev https://storage.googleapis.com",
      'worker-src blob:',
      "frame-ancestors 'none'",
    ].join('; '),
    // Tell browsers to always use HTTPS for 1 year (including subdomains)
    // Only effective when served over HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  })
})
