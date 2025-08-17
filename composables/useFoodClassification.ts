export interface FoodPrediction {
  label: string
  score: number
}

interface InferenceProvider {
  classifyImage(_imageFile: File): Promise<FoodPrediction[]>
}

export const useFoodClassification = (provider: InferenceProvider) => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const classifyFood = async (imageFile: File): Promise<FoodPrediction[]> => {
    try {
      loading.value = true
      error.value = null

      const predictions = await provider.classifyImage(imageFile)

      // Normalize response format
      return predictions.slice(0, 5).map((pred) => ({
        label: pred.label,
        score: pred.score,
      }))
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to classify image'
      throw err
    } finally {
      loading.value = false
    }
  }

  const formatFoodName = (label: string): string => {
    return label.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    classifyFood,
    formatFoodName,
  }
}
