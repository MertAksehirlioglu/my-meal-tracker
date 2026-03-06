import type { H3Event } from 'h3'
import type { AuthenticatedUser } from './auth'
import { ApiErrorCode, createErrorResponse } from './api-error'

// Demo user configuration - get from environment
function getDemoUserEmail(): string {
  const email = process.env.NUXT_PUBLIC_DEMO_EMAIL
  if (!email) {
    throw new Error('NUXT_PUBLIC_DEMO_EMAIL environment variable is required')
  }
  return email
}

/**
 * Checks if the current user is the demo user
 * @param user - The authenticated user object
 * @returns boolean indicating if this is the demo user
 */
export function isDemoUser(user: AuthenticatedUser): boolean {
  return user.email === getDemoUserEmail()
}

/**
 * Checks if the current authenticated user is the demo user from event context
 * @param event - H3Event from the API handler
 * @returns boolean indicating if this is the demo user
 */
export function isDemoUserFromEvent(event: H3Event): boolean {
  const user = event.context.user as AuthenticatedUser
  if (!user) return false
  return isDemoUser(user)
}

/**
 * Blocks write operations for demo users
 * @param event - H3Event from the API handler
 * @throws 403 error if demo user attempts a write operation
 */
export function blockDemoUserWrite(event: H3Event): void {
  if (isDemoUserFromEvent(event)) {
    createErrorResponse(
      ApiErrorCode.DEMO_USER_RESTRICTION,
      'Demo users cannot modify data. This is a read-only demo experience.',
      403,
      'This action is not available in demo mode. Sign up for a full account to save your meals and track your progress!'
    )
  }
}

/**
 * Creates a demo-friendly error response for blocked operations
 * @param operation - Description of the blocked operation
 * @returns Error object with demo-specific messaging
 */
export function createDemoBlockedError(operation: string = 'operation') {
  return createError({
    statusCode: 403,
    statusMessage: `Demo users cannot perform ${operation}`,
    data: {
      isDemoRestriction: true,
      message: `${operation.charAt(0).toUpperCase() + operation.slice(1)} is not available in demo mode. Create a full account to access all features!`,
      action: 'signup_required',
    },
  })
}

/**
 * Validates that a demo user session is properly configured
 * @param user - The authenticated user object
 * @returns boolean indicating if demo user is properly set up
 */
export function validateDemoUser(user: AuthenticatedUser): boolean {
  return user.email === getDemoUserEmail() && !!user.id
}

/**
 * Demo user configuration object
 */
export const DEMO_CONFIG = {
  get EMAIL() {
    return getDemoUserEmail()
  },
  // Demo user restrictions
  RESTRICTIONS: {
    NO_PROFILE_UPDATES: true,
    NO_MEAL_CREATION: true,
    NO_GOAL_UPDATES: true,
    NO_FILE_UPLOADS: true,
    NO_DATA_DELETION: true,
  },
  // Demo session settings
  SESSION: {
    TIMEOUT_HOURS: 4, // Shorter session for demo users
    MAX_CONCURRENT: 10, // Limit concurrent demo sessions if needed
  },
} as const

/**
 * Get demo user credentials from environment
 * @returns Demo user email and password from environment variables
 */
export function getDemoCredentials() {
  const email = getDemoUserEmail()
  const password = process.env.NUXT_PUBLIC_DEMO_PASSWORD

  if (!password) {
    throw new Error(
      'NUXT_PUBLIC_DEMO_PASSWORD environment variable is required'
    )
  }

  return { email, password }
}
