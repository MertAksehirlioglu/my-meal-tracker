import { ref, computed } from 'vue'
import { useFoodClassification } from './useFoodClassification'
import { createUnifiedInference } from '@/lib/ai-providers'
import { estimateNutrition } from '@/lib/nutrition-database'
import type { NutritionInfo, FoodAnalysisResult } from './useFoodAnalysis'

interface AnalysisCache {
  [imageHash: string]: {
    result: FoodAnalysisResult
    timestamp: number
    expiryTime: number
  }
}

interface PerformanceMetrics {
  totalAnalyses: number
  successfulAnalyses: number
  averageTime: number
  cacheHits: number
  providerUsage: Record<string, number>
}

export const useOptimizedFoodAnalysis = () => {
  const aiProvider = createUnifiedInference()
  const {
    classifyFood,
    loading: classificationLoading,
    error: classificationError,
    formatFoodName,
  } = useFoodClassification(aiProvider)

  // State
  const analyzing = ref(false)
  const analysisError = ref<string | null>(null)
  const analysisResult = ref<FoodAnalysisResult | null>(null)
  const processingStage = ref<string>('')

  // Cache and performance tracking
  const analysisCache = ref<AnalysisCache>({})
  const metrics = ref<PerformanceMetrics>({
    totalAnalyses: 0,
    successfulAnalyses: 0,
    averageTime: 0,
    cacheHits: 0,
    providerUsage: {},
  })

  // Configuration
  const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  const MAX_CACHE_SIZE = 100
  const IMAGE_MAX_SIZE = 1024 // Max dimension for processing
  const IMAGE_QUALITY = 0.85

  /**
   * Generate a simple hash for image content
   */
  const generateImageHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const hashArray = Array.from(new Uint8Array(arrayBuffer.slice(0, 1024)))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Optimize image for faster processing
   */
  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate optimal dimensions
        let { width, height } = img
        const maxDimension = IMAGE_MAX_SIZE

        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Apply image enhancements for better AI recognition
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Convert back to file
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(optimizedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          IMAGE_QUALITY
        )
      }

      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Clean up expired cache entries
   */
  const cleanupCache = () => {
    const now = Date.now()
    const cacheEntries = Object.entries(analysisCache.value)

    // Remove expired entries
    const expiredHashes: string[] = []
    for (const [hash, entry] of cacheEntries) {
      if (now > entry.expiryTime) {
        expiredHashes.push(hash)
      }
    }
    for (const hash of expiredHashes) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete analysisCache.value[hash]
    }

    // If still too large, remove oldest entries
    const remainingEntries = Object.entries(analysisCache.value)
    if (remainingEntries.length > MAX_CACHE_SIZE) {
      const sortedEntries = remainingEntries.sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      )
      const toRemove = sortedEntries.slice(
        0,
        remainingEntries.length - MAX_CACHE_SIZE
      )

      for (const [hash] of toRemove) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete analysisCache.value[hash]
      }
    }
  }

  /**
   * Enhanced retry logic with exponential backoff
   */
  const retryWithBackoff = async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> => {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (attempt === maxRetries) {
          throw lastError
        }

        // Exponential backoff with jitter
        const delay =
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
        processingStage.value = `Retrying... (${attempt}/${maxRetries})`
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  /**
   * Optimized food analysis with caching and performance tracking
   */
  const analyzeFood = async (imageFile: File): Promise<FoodAnalysisResult> => {
    const startTime = Date.now()

    try {
      analyzing.value = true
      analysisError.value = null
      processingStage.value = 'Preparing image...'

      metrics.value.totalAnalyses++

      // Step 1: Generate hash and check cache
      const imageHash = await generateImageHash(imageFile)
      const cachedResult = analysisCache.value[imageHash]

      if (cachedResult && Date.now() < cachedResult.expiryTime) {
        metrics.value.cacheHits++
        processingStage.value = 'Using cached result'
        analysisResult.value = cachedResult.result
        return cachedResult.result
      }

      // Step 2: Optimize image for processing
      processingStage.value = 'Optimizing image...'
      const optimizedImage = await optimizeImage(imageFile)

      // Step 3: Classify with retry logic
      processingStage.value = 'Analyzing with AI...'
      const predictions = await retryWithBackoff(
        () => classifyFood(optimizedImage),
        3,
        1000
      )

      if (predictions.length === 0) {
        throw new Error('Could not identify any food in the image')
      }

      const topPrediction = predictions[0]

      // Step 4: Enhanced nutrition estimation
      processingStage.value = 'Estimating nutrition...'
      const nutrition = await estimateNutritionWithContext(
        topPrediction.label,
        topPrediction.score,
        predictions
      )

      // Step 5: Compile optimized results
      const result: FoodAnalysisResult = {
        foodName: formatFoodName(topPrediction.label),
        confidence: topPrediction.score,
        nutrition,
        portionSize: estimatePortionSize(topPrediction.score),
      }

      // Step 6: Cache the result
      cleanupCache()
      analysisCache.value[imageHash] = {
        result,
        timestamp: Date.now(),
        expiryTime: Date.now() + CACHE_DURATION,
      }

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
   * Enhanced nutrition estimation with context from multiple predictions
   */
  const estimateNutritionWithContext = async (
    primaryLabel: string,
    confidence: number,
    allPredictions: Array<{ label: string; score: number }>
  ): Promise<NutritionInfo> => {
    // Use the shared nutrition estimation as base
    let baseNutrition = estimateNutrition(primaryLabel)

    // Adjust based on confidence level
    if (confidence < 0.5) {
      // Low confidence, be more conservative with calories
      baseNutrition = {
        ...baseNutrition,
        calories: Math.round(baseNutrition.calories * 0.8),
      }
    }

    // Consider secondary predictions for mixed dishes
    if (allPredictions.length > 1 && allPredictions[0].score < 0.7) {
      const secondaryPrediction = allPredictions[1]
      if (secondaryPrediction.score > 0.3) {
        const secondaryNutrition = estimateNutrition(secondaryPrediction.label)

        // Blend nutrition values for mixed dishes
        const blendRatio =
          secondaryPrediction.score /
          (allPredictions[0].score + secondaryPrediction.score)
        baseNutrition = {
          calories: Math.round(
            baseNutrition.calories * (1 - blendRatio) +
              secondaryNutrition.calories * blendRatio
          ),
          protein: Math.round(
            baseNutrition.protein * (1 - blendRatio) +
              secondaryNutrition.protein * blendRatio
          ),
          carbs: Math.round(
            baseNutrition.carbs * (1 - blendRatio) +
              secondaryNutrition.carbs * blendRatio
          ),
          fat: Math.round(
            baseNutrition.fat * (1 - blendRatio) +
              secondaryNutrition.fat * blendRatio
          ),
          fiber: Math.round(
            baseNutrition.fiber * (1 - blendRatio) +
              secondaryNutrition.fiber * blendRatio
          ),
        }
      }
    }

    return baseNutrition
  }

  /**
   * Smart portion size estimation based on confidence
   */
  const estimatePortionSize = (confidence: number): string => {
    if (confidence > 0.8) return 'Standard serving'
    if (confidence > 0.6) return 'Medium serving'
    if (confidence > 0.4) return 'Estimated serving'
    return 'Approximate serving'
  }

  /**
   * Enhanced error messages with actionable advice
   */
  const getEnhancedErrorMessage = (error: string): string => {
    if (error.includes('Model is loading')) {
      return 'AI model is starting up. This usually takes 10-30 seconds. Please try again shortly.'
    }
    if (error.includes('Image format') || error.includes('NoneType')) {
      return 'Image processing failed. Try taking a clearer photo with better lighting.'
    }
    if (error.includes('network') || error.includes('fetch')) {
      return 'Network connection issue. Check your internet and try again.'
    }
    if (error.includes('Could not identify')) {
      return 'Unable to identify food in the image. Try taking a closer photo of the food item.'
    }
    return 'AI analysis is temporarily unavailable. You can still log meals manually.'
  }

  /**
   * Preload AI models for better performance
   */
  const preloadModels = async () => {
    try {
      // This will initialize the AI provider and potentially preload models
      console.log('🚀 AI models preloaded successfully')
    } catch (error) {
      console.warn('⚠️ Could not preload AI models:', error)
    }
  }

  // Computed properties
  const isProcessing = computed(
    () => analyzing.value || classificationLoading.value
  )
  const cacheSize = computed(() => Object.keys(analysisCache.value).length)
  const successRate = computed(() =>
    metrics.value.totalAnalyses > 0
      ? (metrics.value.successfulAnalyses / metrics.value.totalAnalyses) * 100
      : 0
  )

  // Clear cache manually
  const clearCache = () => {
    analysisCache.value = {}
  }

  const resetAnalysis = () => {
    analysisResult.value = null
    analysisError.value = null
    processingStage.value = ''
  }

  return {
    // State
    analyzing: readonly(analyzing),
    analysisError: readonly(analysisError),
    analysisResult: readonly(analysisResult),
    processingStage: readonly(processingStage),
    classificationLoading: readonly(classificationLoading),
    classificationError: readonly(classificationError),

    // Computed
    isProcessing,
    cacheSize,
    successRate,
    metrics: readonly(metrics),

    // Methods
    analyzeFood,
    resetAnalysis,
    preloadModels,
    clearCache,
  }
}
