import type { H3Event } from 'h3'

export interface AuthenticatedUser {
  id: string
  email?: string
}

/**
 * Validates that a user is authenticated for API routes
 * @param event - H3Event from the API handler
 * @returns The authenticated user object
 * @throws 401 error if user is not authenticated
 */
export function requireAuth(event: H3Event): AuthenticatedUser {
  const user = event.context.user

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - authentication required',
    })
  }

  return user as AuthenticatedUser
}

/**
 * Validates input data against a schema-like structure
 * @param data - The data to validate
 * @param required - Array of required field names
 * @param optional - Array of optional field names with their types for validation
 * @throws 400 error if validation fails
 */
export function validateInput(
  data: Record<string, unknown>,
  required: string[],
  optional: Record<string, (value: unknown) => boolean> = {}
) {
  // Check required fields
  for (const field of required) {
    if (data[field] === null || data[field] === undefined || data[field] === '') {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required field: ${field}`,
      })
    }
  }

  // Validate optional fields if provided
  for (const [field, validator] of Object.entries(optional)) {
    if (data[field] !== null && data[field] !== undefined) {
      if (!validator(data[field])) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid value for field: ${field}`,
        })
      }
    }
  }
}

/**
 * Common validators for field types
 */
export const validators = {
  isNumber: (value: unknown): boolean => typeof value === 'number' && !isNaN(value),
  isString: (value: unknown): boolean => typeof value === 'string' && value.length > 0,
  isEmail: (value: unknown): boolean => 
    typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  isUrl: (value: unknown): boolean => 
    typeof value === 'string' && /^https?:\/\/.+/.test(value),
  isConfidence: (value: unknown): boolean => 
    typeof value === 'number' && value >= 0 && value <= 1,
  isDateString: (value: unknown): boolean => 
    typeof value === 'string' && !isNaN(Date.parse(value)),
  isMealType: (value: unknown): boolean => 
    typeof value === 'string' && ['breakfast', 'lunch', 'dinner', 'snack'].includes(value),
}