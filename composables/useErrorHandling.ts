import { ref, computed } from 'vue'

export interface ErrorState {
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
  retryable: boolean
  timestamp: number
}

/**
 * Centralized error handling composable.
 * Provides consistent error management across all pages.
 * Use withErrorHandling() for all async operations.
 */
export const useErrorHandling = () => {
  const errors = ref<ErrorState[]>([])
  const isLoading = ref(false)

  const hasErrors = computed(() => errors.value.length > 0)
  const latestError = computed(
    () => errors.value[errors.value.length - 1] || null
  )

  const addError = (
    message: string,
    type: 'error' | 'warning' | 'info' | 'success' = 'error',
    retryable = false
  ) => {
    errors.value.push({
      message,
      type,
      retryable,
      timestamp: Date.now(),
    })

    // Auto-remove after 10 seconds for non-error types
    if (type !== 'error') {
      setTimeout(() => {
        clearError(errors.value.length - 1)
      }, 10000)
    }
  }

  const addSuccess = (message: string) => {
    addError(message, 'success', false)
  }

  const clearError = (index?: number) => {
    if (index !== undefined) {
      errors.value.splice(index, 1)
    } else {
      errors.value = []
    }
  }

  const clearAllErrors = () => {
    errors.value = []
  }

  const handleApiError = (error: unknown, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error)

    let message = 'An unexpected error occurred'
    let retryable = true

    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = (error as { message: string }).message
    }

    // Determine if error is retryable based on message
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      retryable = true
      message = 'Network error. Please check your connection and try again.'
    } else if (message.includes('401') || message.includes('unauthorized')) {
      retryable = false
      message = 'Authentication error. Please log in again.'
    } else if (message.includes('403') || message.includes('forbidden')) {
      retryable = false
      message = 'Access denied. You do not have permission for this action.'
    } else if (message.includes('404') || message.includes('not found')) {
      retryable = false
      message = 'Resource not found.'
    } else if (message.includes('500') || message.includes('server')) {
      retryable = true
      message = 'Server error. Please try again later.'
    }

    addError(message, 'error', retryable)
  }

  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    context?: string,
    showLoading = true
  ): Promise<T | null> => {
    try {
      if (showLoading) isLoading.value = true
      clearAllErrors()

      const result = await operation()
      return result
    } catch (error) {
      handleApiError(error, context)
      return null
    } finally {
      if (showLoading) isLoading.value = false
    }
  }

  const retry = async <T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
    delay = 1000,
    context?: string
  ): Promise<T | null> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          addError(`Retrying... (${attempt}/${maxAttempts})`, 'info')
          await new Promise((resolve) => setTimeout(resolve, delay * attempt))
        }

        return await operation()
      } catch (error) {
        if (attempt === maxAttempts) {
          handleApiError(error, context)
          return null
        }
      }
    }
    return null
  }

  return {
    errors: readonly(errors),
    isLoading: readonly(isLoading),
    hasErrors,
    latestError,
    addError,
    addSuccess,
    clearError,
    clearAllErrors,
    handleApiError,
    withErrorHandling,
    retry,
  }
}

/**
 * Helper function to create a standard error notification object
 * that can be used with v-alert or custom notification components.
 */
export const createErrorNotification = (error: unknown): ErrorState => {
  let message = 'An unexpected error occurred'

  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = (error as { message: string }).message
  }

  return {
    message,
    type: 'error',
    retryable: true,
    timestamp: Date.now(),
  }
}
