/**
 * Optimized Food Analysis Composable
 *
 * Wraps useFoodAnalysis with caching, image resizing, and retry logic.
 * Cache is backed by sessionStorage so it survives Vue router navigations
 * within the same browser tab.
 */

import { ref, computed, readonly } from 'vue'
import { useFoodAnalysis } from './useFoodAnalysis'
import type { FoodAnalysisResult } from './useFoodAnalysis'

const CACHE_TTL = 24 * 60 * 60 * 1000
const MAX_CACHE = 100
const MAX_WIDTH = 1024
const MAX_HEIGHT = 1024
const IMAGE_QUALITY = 0.85
const STORAGE_PREFIX = 'mealsnap-imgcache-'

function getCacheKeys(): string[] {
  const keys: string[] = []
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k?.startsWith(STORAGE_PREFIX)) keys.push(k)
    }
  } catch {
    // sessionStorage unavailable (e.g. private mode restrictions)
  }
  return keys
}

function getCacheSize(): number {
  return getCacheKeys().length
}

function getCached(key: string): FoodAnalysisResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as {
      result: FoodAnalysisResult
      timestamp: number
    }
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(STORAGE_PREFIX + key)
      return null
    }
    return entry.result
  } catch {
    return null
  }
}

function setCached(key: string, result: FoodAnalysisResult) {
  try {
    const keys = getCacheKeys()
    if (keys.length >= MAX_CACHE) {
      sessionStorage.removeItem(keys[0])
    }
    sessionStorage.setItem(
      STORAGE_PREFIX + key,
      JSON.stringify({ result, timestamp: Date.now() })
    )
  } catch {
    // sessionStorage may be full or unavailable; silently skip caching
  }
}

function clearCache() {
  getCacheKeys().forEach((k) => sessionStorage.removeItem(k))
}

function generateImageHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      let hash = 0
      const str = (reader.result as string).slice(0, 1024)
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0
      }
      resolve(`${hash}-${file.size}-${file.lastModified}`)
    }
    reader.readAsDataURL(file)
  })
}

function optimizeImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (file.size < 100 * 1024) {
      resolve(file)
      return
    }
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) =>
          resolve(
            blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file
          ),
        'image/jpeg',
        IMAGE_QUALITY
      )
    }
    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}

interface AnalysisMetrics {
  totalAnalyses: number
  successfulAnalyses: number
  averageTime: number
  cacheHits: number
  retries: number
}

export const useOptimizedFoodAnalysis = () => {
  const baseFoodAnalysis = useFoodAnalysis()

  const analyzing = ref(false)
  const analysisError = ref<string | null>(null)
  const analysisResult = ref<FoodAnalysisResult | null>(null)
  const processingStage = ref<string>('')

  const metrics = ref<AnalysisMetrics>({
    totalAnalyses: 0,
    successfulAnalyses: 0,
    averageTime: 0,
    cacheHits: 0,
    retries: 0,
  })

  /**
   * Retry an async operation with exponential backoff
   */
  const retryWithBackoff = async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> => {
    let lastError: Error
    let retryCount = 0

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        retryCount = attempt

        if (attempt === maxRetries) {
          metrics.value.retries += retryCount
          throw lastError
        }

        const delay =
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
        processingStage.value = `Retrying... (${attempt}/${maxRetries})`
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  /**
   * Enhanced error messages for better user experience
   */
  const getEnhancedErrorMessage = (error: string): string => {
    if (error.includes('Model is loading') || error.includes('loading')) {
      return 'AI model is starting up. This usually takes 10-30 seconds. Please try again shortly.'
    }
    if (
      error.includes('Image format') ||
      error.includes('NoneType') ||
      error.includes('decode')
    ) {
      return 'Image processing failed. Try taking a clearer photo with better lighting.'
    }
    if (error.includes('network') || error.includes('fetch')) {
      return 'Network connection issue. Check your internet and try again.'
    }
    if (
      error.includes('Could not identify') ||
      error.includes('NO_FOOD_DETECTED')
    ) {
      return 'Unable to identify food in the image. Try taking a closer photo of the food item.'
    }
    return 'AI analysis is temporarily unavailable. You can still log meals manually.'
  }

  /**
   * Analyze food image with optimizations
   */
  const analyzeFood = async (imageFile: File): Promise<FoodAnalysisResult> => {
    const startTime = Date.now()

    try {
      analyzing.value = true
      analysisError.value = null
      processingStage.value = 'Preparing image...'
      metrics.value.totalAnalyses++

      // Check cache first
      const imageHash = await generateImageHash(imageFile)
      const cached = getCached(imageHash)
      if (cached) {
        metrics.value.cacheHits++
        processingStage.value = 'Using cached result'
        analysisResult.value = cached
        return cached
      }

      // Optimize image
      processingStage.value = 'Optimizing image...'
      const optimizedImage = await optimizeImage(imageFile)

      // Analyze with retry logic (delegates to base composable)
      processingStage.value = 'Analyzing with AI...'
      const result = await retryWithBackoff(
        () => baseFoodAnalysis.analyzeFood(optimizedImage),
        3,
        1000
      )

      if (!result) {
        throw new Error('Could not identify any food in the image')
      }

      // Cache successful result
      setCached(imageHash, result)

      // Update metrics
      const analysisTime = Date.now() - startTime
      metrics.value.successfulAnalyses++
      metrics.value.averageTime =
        (metrics.value.averageTime * (metrics.value.successfulAnalyses - 1) +
          analysisTime) /
        metrics.value.successfulAnalyses

      analysisResult.value = result
      return result
    } catch (err) {
      console.error('Optimized food analysis error:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to analyze food'
      analysisError.value = getEnhancedErrorMessage(errorMessage)
      throw err
    } finally {
      analyzing.value = false
      processingStage.value = ''
    }
  }

  /**
   * Reset analysis state
   */
  const resetAnalysis = () => {
    analysisResult.value = null
    analysisError.value = null
    processingStage.value = ''
  }

  /**
   * Computed: Is currently processing (analyzing or base classification loading)
   */
  const isProcessing = computed(
    () => analyzing.value || baseFoodAnalysis.analyzing.value
  )

  /**
   * Computed: Success rate percentage
   */
  const successRate = computed(() =>
    metrics.value.totalAnalyses > 0
      ? (metrics.value.successfulAnalyses / metrics.value.totalAnalyses) * 100
      : 0
  )

  return {
    // State
    analyzing: readonly(analyzing),
    analysisError: readonly(analysisError),
    analysisResult: readonly(analysisResult),
    processingStage: readonly(processingStage),
    isProcessing,
    cacheSize: computed(getCacheSize),
    successRate,
    metrics: readonly(metrics),

    // Methods
    analyzeFood,
    resetAnalysis,
    clearCache,

    // Expose base composable for direct access if needed
    baseAnalyzing: baseFoodAnalysis.analyzing,
    baseError: baseFoodAnalysis.analysisError,
    createManualAnalysis: baseFoodAnalysis.createManualAnalysis,
  }
}
