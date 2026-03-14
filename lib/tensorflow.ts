/**
 * TensorFlow.js Food Classification Provider
 * Runs models locally in the browser - no API calls needed!
 */

interface TensorFlowPrediction {
  label: string
  score: number
}

// Module-level singleton — model loads once per session
let modelPromise: Promise<{
  mobilenetModel: {
    classify?: (
      _element: HTMLImageElement
    ) => Promise<Array<{ className: string; probability: number }>>
  } | null
  cocoModel: {
    detect?: (
      _element: HTMLImageElement
    ) => Promise<Array<{ class: string; score: number }>>
  } | null
}> | null = null

export class TensorFlowInference {
  private mobilenetModel: {
    classify?: (
      _element: HTMLImageElement
    ) => Promise<Array<{ className: string; probability: number }>>
  } | null = null
  private cocoModel: {
    detect?: (
      _element: HTMLImageElement
    ) => Promise<Array<{ class: string; score: number }>>
  } | null = null

  async classifyImage(imageFile: File): Promise<TensorFlowPrediction[]> {
    console.log('🧠 TensorFlow.js: Starting local image classification')

    try {
      // Load models if needed
      await this.loadModels()

      // Create image element from file
      const imageElement = await this.fileToImageElement(imageFile)

      // Try both models and combine results
      const results: TensorFlowPrediction[] = []

      // 1. MobileNet for general image classification
      if (this.mobilenetModel?.classify) {
        try {
          const mobilenetPredictions =
            await this.mobilenetModel.classify(imageElement)
          console.log('📱 MobileNet predictions:', mobilenetPredictions)

          // Convert to our format and filter food-related items
          mobilenetPredictions
            .slice(0, 3)
            .forEach((pred: { className: string; probability: number }) => {
              const foodScore = this.calculateFoodRelevance(pred.className)
              if (foodScore > 0) {
                results.push({
                  label: pred.className,
                  score: pred.probability * foodScore,
                })
              }
            })
        } catch (error) {
          console.warn('MobileNet classification failed:', error)
        }
      }

      // 2. COCO-SSD for object detection (might catch food items)
      if (this.cocoModel?.detect) {
        try {
          const cocoDetections = await this.cocoModel.detect(imageElement)
          console.log('🎯 COCO-SSD detections:', cocoDetections)

          // Convert detections to classifications
          cocoDetections.forEach(
            (detection: { class: string; score: number }) => {
              const foodScore = this.calculateFoodRelevance(detection.class)
              if (foodScore > 0 && detection.score > 0.3) {
                results.push({
                  label: detection.class,
                  score: detection.score * foodScore,
                })
              }
            }
          )
        } catch (error) {
          console.warn('COCO-SSD detection failed:', error)
        }
      }

      // Sort by score and return top results
      const sortedResults = results
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      console.log('✅ TensorFlow.js final results:', sortedResults)

      // If no food-related items found, throw error instead of returning generic result
      if (sortedResults.length === 0) {
        throw new Error('NO_FOOD_DETECTED')
      }

      // Filter out very low confidence results
      const confidentResults = sortedResults.filter(
        (result) => result.score > 0.1
      )

      if (confidentResults.length === 0) {
        throw new Error('NO_FOOD_DETECTED')
      }

      return confidentResults
    } catch (error) {
      console.error('TensorFlow.js classification error:', error)
      throw new Error(
        `Local AI classification failed: ${(error as Error).message}`
      )
    }
  }

  private async loadModels() {
    // Use module-level singleton so models load only once per session
    if (modelPromise) {
      console.log('Using cached TF model')
      const cached = await modelPromise
      this.mobilenetModel = cached.mobilenetModel
      this.cocoModel = cached.cocoModel
      return
    }

    console.log('Loading TF model...')

    modelPromise = (async () => {
      // Dynamic imports to avoid SSR issues
      const [tf, mobilenet, cocoSsd] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/mobilenet'),
        import('@tensorflow-models/coco-ssd'),
      ])

      // Set backend (try WebGL first, fallback to CPU)
      try {
        await tf.setBackend('webgl')
        await tf.ready()
        console.log('🚀 Using WebGL backend')
      } catch {
        await tf.setBackend('cpu')
        await tf.ready()
        console.log('💻 Using CPU backend')
      }

      // Load models in parallel
      const [mobilenetModel, cocoModel] = await Promise.all([
        mobilenet
          .load({
            version: 2,
            alpha: 1.0,
          })
          .catch((error) => {
            console.warn('MobileNet failed to load:', error)
            return null
          }),
        cocoSsd.load().catch((error) => {
          console.warn('COCO-SSD failed to load:', error)
          return null
        }),
      ])

      console.log('✅ TensorFlow.js models loaded successfully')
      console.log('   - MobileNet:', !!mobilenetModel)
      console.log('   - COCO-SSD:', !!cocoModel)

      return { mobilenetModel, cocoModel }
    })()

    // On error, clear the singleton so next call retries
    modelPromise.catch(() => {
      modelPromise = null
    })

    const loaded = await modelPromise
    this.mobilenetModel = loaded.mobilenetModel
    this.cocoModel = loaded.cocoModel
  }

  private async fileToImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // Clean up blob URL
        URL.revokeObjectURL(img.src)
        resolve(img)
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  private calculateFoodRelevance(className: string): number {
    const foodKeywords = [
      // Direct food items
      'pizza',
      'hamburger',
      'hot dog',
      'sandwich',
      'taco',
      'burrito',
      'soup',
      'salad',
      'pasta',
      'noodles',
      'rice',
      'bread',
      'cake',
      'cookie',
      'donut',
      'ice cream',
      'banana',
      'apple',
      'orange',

      // Food-related objects
      'plate',
      'bowl',
      'cup',
      'fork',
      'spoon',
      'knife',
      'dining table',
      'wine glass',
      'coffee cup',
      'food',
      'meal',

      // Context that might indicate food
      'restaurant',
      'kitchen',
      'dining room',
    ]

    const normalizedClassName = className.toLowerCase()

    // Direct food matches get highest score
    for (const keyword of foodKeywords.slice(0, 10)) {
      if (normalizedClassName.includes(keyword)) {
        return 1.0
      }
    }

    // Food-related objects get medium score
    for (const keyword of foodKeywords.slice(10, 20)) {
      if (normalizedClassName.includes(keyword)) {
        return 0.7
      }
    }

    // Context items get lower score
    for (const keyword of foodKeywords.slice(20)) {
      if (normalizedClassName.includes(keyword)) {
        return 0.3
      }
    }

    return 0 // Not food-related
  }
}

// Factory function
export const createTensorFlowInference = () => {
  return new TensorFlowInference()
}
