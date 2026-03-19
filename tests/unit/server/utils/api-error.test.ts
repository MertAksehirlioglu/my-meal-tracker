import { describe, it, expect } from 'vitest'
import {
  ApiErrorCode,
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
} from '~/server/utils/api-error'

describe('ApiErrorCode', () => {
  it('has the expected error code values', () => {
    expect(ApiErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED')
    expect(ApiErrorCode.DEMO_USER_RESTRICTION).toBe('DEMO_USER_RESTRICTION')
    expect(ApiErrorCode.MISSING_REQUIRED_FIELDS).toBe('MISSING_REQUIRED_FIELDS')
    expect(ApiErrorCode.INVALID_INPUT).toBe('INVALID_INPUT')
    expect(ApiErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR')
    expect(ApiErrorCode.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR')
  })
})

describe('createSuccessResponse', () => {
  it('returns success: true with data', () => {
    const result = createSuccessResponse({ id: 1 })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ id: 1 })
  })

  it('includes optional message when provided', () => {
    const result = createSuccessResponse(null, 'Created successfully')
    expect(result.message).toBe('Created successfully')
  })

  it('message is undefined when not provided', () => {
    const result = createSuccessResponse([])
    expect(result.message).toBeUndefined()
  })
})

describe('createErrorResponse', () => {
  it('throws an H3 error with the given status code', () => {
    expect(() =>
      createErrorResponse(ApiErrorCode.UNAUTHORIZED, 'Not allowed', 401)
    ).toThrow()
  })

  it('throws an error with the correct statusCode', () => {
    try {
      createErrorResponse(ApiErrorCode.INVALID_INPUT, 'Bad input', 400)
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect(e.statusCode).toBe(400)
    }
  })

  it('includes the error code in the thrown error data', () => {
    try {
      createErrorResponse(ApiErrorCode.DATABASE_ERROR, 'DB failed', 500)
    } catch (err: unknown) {
      const e = err as { data?: { error?: { code: string } } }
      expect(e.data?.error?.code).toBe(ApiErrorCode.DATABASE_ERROR)
    }
  })
})

describe('defineWrappedEventHandler', () => {
  it('returns the handler result on success', async () => {
    const { defineWrappedEventHandler } = await import(
      '~/server/utils/api-error'
    )
    const handler = defineWrappedEventHandler(async () => ({ ok: true }))
    const result = await handler({} as Parameters<typeof handler>[0])
    expect(result).toEqual({ ok: true })
  })

  it('re-throws H3 errors from the handler', async () => {
    const { defineWrappedEventHandler } = await import(
      '~/server/utils/api-error'
    )
    const handler = defineWrappedEventHandler(async () => {
      throw { statusCode: 404, statusMessage: 'Not Found' }
    })
    await expect(
      handler({} as Parameters<typeof handler>[0])
    ).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('wraps unexpected errors from the handler as 500', async () => {
    const { defineWrappedEventHandler } = await import(
      '~/server/utils/api-error'
    )
    const handler = defineWrappedEventHandler(async () => {
      throw new Error('unexpected')
    })
    await expect(
      handler({} as Parameters<typeof handler>[0])
    ).rejects.toMatchObject({
      statusCode: 500,
    })
  })
})

describe('handleApiError', () => {
  it('re-throws H3 errors as-is', () => {
    const h3Error = { statusCode: 404, statusMessage: 'Not Found' }
    expect(() => handleApiError(h3Error)).toThrow()
    try {
      handleApiError(h3Error)
    } catch (err) {
      expect(err).toBe(h3Error)
    }
  })

  it('wraps unexpected errors as 500', () => {
    try {
      handleApiError(new Error('something broke'))
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect(e.statusCode).toBe(500)
    }
  })

  it('wraps non-Error unexpected values as 500', () => {
    try {
      handleApiError('a string error')
    } catch (err: unknown) {
      const e = err as { statusCode?: number }
      expect(e.statusCode).toBe(500)
    }
  })
})
