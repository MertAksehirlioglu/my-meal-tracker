import { useFoodClassification } from './useFoodClassification'
// ai-providers is NOT statically imported — it is loaded lazily inside
// useFoodAnalysis() so the TensorFlow.js dependency tree is excluded from
// the initial bundle and only fetched when the snap page is actually used.
import { estimateNutrition as sharedEstimateNutrition } from '@/lib/nutrition-database'

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface FoodAnalysisResult {
  foodName: string
  confidence: number
  nutrition: NutritionInfo
  portionSize: string
}

export const useFoodAnalysis = () => {
  // Lazy inference provider — resolved on first classifyFood call so that the
  // ai-providers module (and the TensorFlow.js tree it pulls in) are never
  // bundled into the initial page load.
  let _aiProvider: ReturnType<
    (typeof import('@/lib/ai-providers'))['createUnifiedInference']
  > | null = null

  const getAiProvider = async () => {
    if (!_aiProvider) {
      const { createUnifiedInference } = await import('@/lib/ai-providers')
      _aiProvider = createUnifiedInference()
    }
    return _aiProvider
  }

  // useFoodClassification is a thin reactive wrapper; pass a proxy that
  // delegates to the lazily-loaded provider.
  const lazyProvider = {
    classifyImage: async (file: File) => {
      const provider = await getAiProvider()
      return provider.classifyImage(file)
    },
  }

  const {
    classifyFood,
    loading: classificationLoading,
    error: classificationError,
    formatFoodName,
  } = useFoodClassification(lazyProvider)

  const analyzing = ref(false)
  const analysisError = ref<string | null>(null)
  const analysisResult = ref<FoodAnalysisResult | null>(null)

  // Use shared nutrition estimation
  const estimateNutrition = sharedEstimateNutrition

  const analyzeFood = async (imageFile: File): Promise<FoodAnalysisResult> => {
    try {
      analyzing.value = true
      analysisError.value = null

      // Step 1: Classify the food
      const predictions = await classifyFood(imageFile)

      if (predictions.length === 0) {
        throw new Error('Could not classify the food in the image')
      }

      const topPrediction = predictions[0]

      // Step 2: Estimate nutrition based on classification
      const nutrition = estimateNutrition(topPrediction.label)

      // Step 3: Compile results
      const result: FoodAnalysisResult = {
        foodName: formatFoodName(topPrediction.label),
        confidence: topPrediction.score,
        nutrition,
        portionSize: 'Medium serving', // TODO: Implement portion estimation
      }

      analysisResult.value = result
      return result
    } catch (err) {
      console.error('Food analysis error:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to analyze food'
      analysisError.value = errorMessage

      // Provide user-friendly error messages
      if (errorMessage.includes('NO_FOOD_DETECTED')) {
        analysisError.value =
          'No food could be detected in this image. Please try retaking the photo with better lighting and focus, or manually enter your meal information.'
      } else if (errorMessage.includes('Model is loading')) {
        analysisError.value =
          'AI model is starting up. Please wait a moment and try again.'
      } else if (
        errorMessage.includes('Image format') ||
        errorMessage.includes('NoneType')
      ) {
        analysisError.value =
          'AI service is temporarily unavailable. Use manual entry to log your meal.'
      } else if (errorMessage.includes('Invalid Hugging Face API token')) {
        analysisError.value =
          'AI service configuration issue. Use manual entry to continue.'
      } else if (errorMessage.includes('No Inference Provider')) {
        analysisError.value =
          'AI service is currently down. Use manual entry to log your meal.'
      } else {
        analysisError.value =
          'AI analysis unavailable right now. You can still log meals manually.'
      }

      throw err
    } finally {
      analyzing.value = false
    }
  }

  // Manual analysis fallback when AI fails
  const createManualAnalysis = (foodName: string): FoodAnalysisResult => {
    const nutrition = estimateNutrition(foodName)

    return {
      foodName: formatFoodName(foodName),
      confidence: 0, // Manual entry has no confidence score
      nutrition,
      portionSize: 'Medium serving',
    }
  }

  const resetAnalysis = () => {
    analysisResult.value = null
    analysisError.value = null
  }

  return {
    // State
    analyzing: readonly(analyzing),
    analysisError: readonly(analysisError),
    analysisResult: readonly(analysisResult),
    classificationLoading: readonly(classificationLoading),
    classificationError: readonly(classificationError),

    // Methods
    analyzeFood,
    createManualAnalysis,
    resetAnalysis,
  }
}
