interface FoodClassification {
  label: string
  confidence: number
}

interface FoodMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
}

interface FoodAnalysisResult {
  classification: FoodClassification
  macros: FoodMacros
}

interface AnalysisOptions {
  portion?: number // in grams
  confidence?: number // minimum confidence threshold
}

interface ApiResponse<T> {
  success: boolean
  error?: string
  data?: T
}

interface ClassificationResponse {
  success: boolean
  error?: string
  classification: FoodClassification
}

interface MacrosResponse {
  success: boolean
  error?: string
  macros: FoodMacros
}

export const useFoodAnalysis = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Classify food from an image
   * @param imageData - Base64 image data
   * @param options - Analysis options
   * @returns Promise<FoodClassification>
   */
  const classifyFood = async (
    imageData: string,
    options: AnalysisOptions = {}
  ): Promise<FoodClassification> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ClassificationResponse>('/api/classify', {
        method: 'POST',
        body: {
          image: imageData,
          options
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Classification failed')
      }

      return response.classification
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Compute macros for a food item
   * @param foodName - Name of the food
   * @param portion - Portion size in grams
   * @returns Promise<FoodMacros>
   */
  const computeMacros = async (
    foodName: string,
    portion: number = 100
  ): Promise<FoodMacros> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<MacrosResponse>('/api/macros', {
        method: 'POST',
        body: {
          foodName,
          portion
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Macro computation failed')
      }

      return response.macros
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Analyze food from image and compute macros
   * @param imageData - Base64 image data
   * @param options - Analysis options
   * @returns Promise<FoodAnalysisResult>
   */
  const analyzeFood = async (
    imageData: string,
    options: AnalysisOptions = {}
  ): Promise<FoodAnalysisResult> => {
    loading.value = true
    error.value = null

    try {
      // First classify the food
      const classification = await classifyFood(imageData, options)
      
      // Then compute macros based on the classification
      const macros = await computeMacros(classification.label, options.portion)

      return {
        classification,
        macros
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Food analysis failed'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset all states
   */
  const reset = () => {
    loading.value = false
    error.value = null
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    
    // Methods
    classifyFood,
    computeMacros,
    analyzeFood,
    clearError,
    reset
  }
} 