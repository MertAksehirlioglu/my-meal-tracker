import type { H3Event } from 'h3'
import { createError } from 'h3'
import { ApiErrorCode } from './api-error'

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
      statusMessage: 'Authentication required',
      data: {
        success: false,
        message: 'Authentication required',
        error: { code: ApiErrorCode.UNAUTHORIZED },
      },
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
  optional: Record<string, (_value: unknown) => boolean> = {}
) {
  // Check required fields
  const missingFields: string[] = []
  for (const field of required) {
    if (
      data[field] === null ||
      data[field] === undefined ||
      data[field] === ''
    ) {
      missingFields.push(field)
    }
  }

  if (missingFields.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing required fields: ${missingFields.join(', ')}`,
      data: {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: {
          code: ApiErrorCode.MISSING_REQUIRED_FIELDS,
          details: JSON.stringify({ fields: missingFields }),
        },
      },
    })
  }

  // Validate optional fields if provided
  const invalidFields: string[] = []
  for (const [field, validator] of Object.entries(optional)) {
    if (data[field] !== null && data[field] !== undefined) {
      if (!validator(data[field])) {
        invalidFields.push(field)
      }
    }
  }

  if (invalidFields.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid values for fields: ${invalidFields.join(', ')}`,
      data: {
        success: false,
        message: `Invalid values for fields: ${invalidFields.join(', ')}`,
        error: {
          code: ApiErrorCode.INVALID_INPUT,
          details: JSON.stringify({ fields: invalidFields }),
        },
      },
    })
  }
}

/**
 * Common validators for field types
 */
export const validators = {
  isNumber: (value: unknown): boolean =>
    typeof value === 'number' && !isNaN(value),
  isString: (value: unknown): boolean =>
    typeof value === 'string' && value.length > 0,
  isEmail: (value: unknown): boolean =>
    typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  isUrl: (value: unknown): boolean =>
    typeof value === 'string' && /^https?:\/\/.+/.test(value),
  isConfidence: (value: unknown): boolean =>
    typeof value === 'number' && value >= 0 && value <= 1,
  isDateString: (value: unknown): boolean =>
    typeof value === 'string' && !isNaN(Date.parse(value)),
  isMealType: (value: unknown): boolean =>
    typeof value === 'string' &&
    ['breakfast', 'lunch', 'dinner', 'snack'].includes(value),
}
