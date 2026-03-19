import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  useErrorHandling,
  createErrorNotification,
} from '~/composables/useErrorHandling'

describe('useErrorHandling', () => {
  describe('initial state', () => {
    it('starts with no errors', () => {
      const { errors } = useErrorHandling()
      expect(errors.value).toHaveLength(0)
    })

    it('starts with isLoading false', () => {
      const { isLoading } = useErrorHandling()
      expect(isLoading.value).toBe(false)
    })

    it('hasErrors is false initially', () => {
      const { hasErrors } = useErrorHandling()
      expect(hasErrors.value).toBe(false)
    })

    it('latestError is null initially', () => {
      const { latestError } = useErrorHandling()
      expect(latestError.value).toBeNull()
    })
  })

  describe('addError', () => {
    it('adds an error to the list', () => {
      const { errors, addError } = useErrorHandling()
      addError('something went wrong')
      expect(errors.value).toHaveLength(1)
      expect(errors.value[0].message).toBe('something went wrong')
    })

    it('defaults to type "error" and retryable false', () => {
      const { errors, addError } = useErrorHandling()
      addError('oops')
      expect(errors.value[0].type).toBe('error')
      expect(errors.value[0].retryable).toBe(false)
    })

    it('accepts custom type and retryable flag', () => {
      const { errors, addError } = useErrorHandling()
      addError('heads up', 'warning', true)
      expect(errors.value[0].type).toBe('warning')
      expect(errors.value[0].retryable).toBe(true)
    })

    it('hasErrors becomes true after adding an error', () => {
      const { hasErrors, addError } = useErrorHandling()
      addError('fail')
      expect(hasErrors.value).toBe(true)
    })

    it('latestError reflects the most recently added error', () => {
      const { latestError, addError } = useErrorHandling()
      addError('first')
      addError('second')
      expect(latestError.value?.message).toBe('second')
    })

    it('sets a timestamp on each error', () => {
      const before = Date.now()
      const { errors, addError } = useErrorHandling()
      addError('timed')
      expect(errors.value[0].timestamp).toBeGreaterThanOrEqual(before)
    })
  })

  describe('addSuccess', () => {
    it('adds a success-typed error entry', () => {
      const { errors, addSuccess } = useErrorHandling()
      addSuccess('Saved!')
      expect(errors.value[0].type).toBe('success')
      expect(errors.value[0].message).toBe('Saved!')
    })
  })

  describe('clearError', () => {
    it('removes the error at the given index', () => {
      const { errors, addError, clearError } = useErrorHandling()
      addError('first')
      addError('second')
      clearError(0)
      expect(errors.value).toHaveLength(1)
      expect(errors.value[0].message).toBe('second')
    })

    it('clears all errors when called without an index', () => {
      const { errors, addError, clearError } = useErrorHandling()
      addError('first')
      addError('second')
      clearError()
      expect(errors.value).toHaveLength(0)
    })
  })

  describe('clearAllErrors', () => {
    it('removes all errors', () => {
      const { errors, addError, clearAllErrors } = useErrorHandling()
      addError('one')
      addError('two')
      clearAllErrors()
      expect(errors.value).toHaveLength(0)
    })
  })

  describe('handleApiError', () => {
    it('adds an error message from an Error instance', () => {
      const { errors, handleApiError } = useErrorHandling()
      handleApiError(new Error('fetch failed'))
      expect(errors.value).toHaveLength(1)
      expect(errors.value[0].message).toContain('Network error')
    })

    it('adds an error message from a string', () => {
      const { errors, handleApiError } = useErrorHandling()
      handleApiError('something broke')
      expect(errors.value).toHaveLength(1)
    })

    it('adds a generic message for unknown error shapes', () => {
      const { errors, handleApiError } = useErrorHandling()
      handleApiError(42)
      expect(errors.value[0].message).toBe('An unexpected error occurred')
    })

    it('shows authentication error for 401 messages', () => {
      const { errors, handleApiError } = useErrorHandling()
      handleApiError('401 not authorized')
      expect(errors.value[0].message).toContain('Authentication error')
      expect(errors.value[0].retryable).toBe(false)
    })

    it('shows forbidden error for 403 messages', () => {
      const { errors, handleApiError } = useErrorHandling()
      handleApiError('403 forbidden')
      expect(errors.value[0].message).toContain('Access denied')
      expect(errors.value[0].retryable).toBe(false)
    })

    it('shows not found error for 404 messages', () => {
      const { errors, handleApiError } = useErrorHandling()
      handleApiError('404 not found')
      expect(errors.value[0].message).toContain('not found')
      expect(errors.value[0].retryable).toBe(false)
    })

    it('shows server error for 500 messages', () => {
      const { errors, handleApiError } = useErrorHandling()
      handleApiError('500 server error')
      expect(errors.value[0].message).toContain('Server error')
      expect(errors.value[0].retryable).toBe(true)
    })
  })

  describe('withErrorHandling', () => {
    it('returns the result of a successful operation', async () => {
      const { withErrorHandling } = useErrorHandling()
      const result = await withErrorHandling(async () => 42)
      expect(result).toBe(42)
    })

    it('returns null and adds an error on failure', async () => {
      const { errors, withErrorHandling } = useErrorHandling()
      const result = await withErrorHandling(async () => {
        throw new Error('boom')
      })
      expect(result).toBeNull()
      expect(errors.value).toHaveLength(1)
    })

    it('sets isLoading to true during operation and false after', async () => {
      const { isLoading, withErrorHandling } = useErrorHandling()
      let loadingDuringOp = false
      await withErrorHandling(async () => {
        loadingDuringOp = isLoading.value
      })
      expect(loadingDuringOp).toBe(true)
      expect(isLoading.value).toBe(false)
    })

    it('clears existing errors before running', async () => {
      const { errors, addError, withErrorHandling } = useErrorHandling()
      addError('old error')
      await withErrorHandling(async () => 'ok')
      expect(errors.value).toHaveLength(0)
    })
  })

  describe('retry', () => {
    it('returns the result when the operation eventually succeeds', async () => {
      const { retry } = useErrorHandling()
      let attempts = 0
      const result = await retry(
        async () => {
          attempts++
          if (attempts < 2) throw new Error('not yet')
          return 'success'
        },
        3,
        0
      )
      expect(result).toBe('success')
    })

    it('returns null and adds an error after max attempts', async () => {
      const { errors, retry } = useErrorHandling()
      // Use delay=0 so setTimeout(resolve, 0) resolves in the event loop
      const result = await retry(
        async () => {
          throw new Error('always fails')
        },
        3,
        0
      )
      expect(result).toBeNull()
      expect(errors.value.some((e) => e.type === 'error')).toBe(true)
    })
  })
})

describe('createErrorNotification', () => {
  it('creates a notification from an Error instance', () => {
    const n = createErrorNotification(new Error('oops'))
    expect(n.message).toBe('oops')
    expect(n.type).toBe('error')
    expect(n.retryable).toBe(true)
  })

  it('creates a notification from a string', () => {
    const n = createErrorNotification('something broke')
    expect(n.message).toBe('something broke')
  })

  it('creates a notification from an object with a message property', () => {
    const n = createErrorNotification({ message: 'obj error' })
    expect(n.message).toBe('obj error')
  })

  it('falls back to default message for unknown shapes', () => {
    const n = createErrorNotification(null)
    expect(n.message).toBe('An unexpected error occurred')
  })

  it('sets a timestamp', () => {
    const before = Date.now()
    const n = createErrorNotification('test')
    expect(n.timestamp).toBeGreaterThanOrEqual(before)
  })
})
