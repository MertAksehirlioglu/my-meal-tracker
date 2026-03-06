import type { H3Event } from 'h3'

/**
 * Standard error codes used across API routes.
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  DEMO_USER_RESTRICTION = 'DEMO_USER_RESTRICTION',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  INVALID_INPUT = 'INVALID_INPUT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * Creates a standardized success response.
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  }
}

/**
 * Creates a standardized error response.
 */
export function createErrorResponse(
  code: ApiErrorCode | string,
  message: string,
  statusCode: number,
  details?: string
): never {
  throw createError({
    statusCode,
    statusMessage: message,
    data: {
      success: false,
      message,
      error: {
        code,
        details,
      },
    },
  })
}

/**
 * Standardized error handler for all API route catch blocks.
 * Re-throws H3 errors as-is so that status codes and structured
 * error data set earlier in the handler are preserved. Wraps
 * unexpected errors in a generic 500 response.
 */
export function handleApiError(error: unknown): never {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    throw error
  }

  // Log unexpected errors
  console.error('Unexpected API error:', error)

  throw createError({
    statusCode: 500,
    statusMessage: 'Internal server error',
    data: {
      success: false,
      message: 'Internal server error',
      error: {
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      },
    },
  })
}

/**
 * Wraps a route handler with consistent error handling.
 * H3 errors (from createError / requireAuth / blockDemoUserWrite)
 * are re-thrown as-is; unexpected errors become 500s.
 */
export function defineWrappedEventHandler<T>(
  handler: (_event: H3Event) => Promise<T>
) {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event)
    } catch (error: unknown) {
      handleApiError(error)
    }
  })
}
