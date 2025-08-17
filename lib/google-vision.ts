/**
 * Google Cloud Vision API Food Classification Provider
 * Uses Google's Vision API for object detection and labeling
 */

interface GoogleVisionPrediction {
  label: string
  score: number
}

export class GoogleVisionInference {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async classifyImage(imageFile: File): Promise<GoogleVisionPrediction[]> {
    console.log('🔍 Google Vision: Starting food analysis')

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile)

      // Use multiple Vision API features for comprehensive analysis
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 10 },
                  { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
                  { type: 'TEXT_DETECTION', maxResults: 3 },
                ],
              },
            ],
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Google Vision API error (${response.status}): ${errorData.error?.message || response.statusText}`
        )
      }

      const data = await response.json()
      console.log('🔍 Google Vision response:', data)

      const annotations = data.responses?.[0]

      if (!annotations) {
        throw new Error('No response from Google Vision API')
      }

      const predictions: GoogleVisionPrediction[] = []

      // Process label detection results
      if (annotations.labelAnnotations) {
        annotations.labelAnnotations.forEach(
          (label: { description: string; score: number }) => {
            const foodRelevance = this.calculateFoodRelevance(label.description)
            if (foodRelevance > 0) {
              predictions.push({
                label: label.description.toLowerCase(),
                score: label.score * foodRelevance,
              })
            }
          }
        )
      }

      // Process object localization results
      if (annotations.localizedObjectAnnotations) {
        annotations.localizedObjectAnnotations.forEach(
          (obj: { name: string; score: number }) => {
            const foodRelevance = this.calculateFoodRelevance(obj.name)
            if (foodRelevance > 0) {
              predictions.push({
                label: obj.name.toLowerCase(),
                score: obj.score * foodRelevance,
              })
            }
          }
        )
      }

      // Process any text that might indicate food (menu items, labels)
      if (
        annotations.textAnnotations &&
        annotations.textAnnotations.length > 0
      ) {
        const detectedText = annotations.textAnnotations[0].description
        const foodFromText = this.extractFoodFromText(detectedText)
        if (foodFromText !== 'mixed meal') {
          predictions.push({
            label: foodFromText,
            score: 0.6, // Medium confidence for text-based detection
          })
        }
      }

      // Sort by score and return top results
      const sortedResults = predictions
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      console.log('✅ Google Vision final results:', sortedResults)

      // If no food-related items found, add generic classification
      if (sortedResults.length === 0) {
        sortedResults.push({
          label: 'mixed meal',
          score: 0.5,
        })
      }

      return sortedResults
    } catch (error) {
      console.error('Google Vision classification error:', error)
      throw new Error(
        `Google Vision analysis failed: ${(error as Error).message}`
      )
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private calculateFoodRelevance(label: string): number {
    const foodKeywords = [
      // Direct food items (high relevance)
      'food',
      'meal',
      'dish',
      'cuisine',
      'pizza',
      'burger',
      'sandwich',
      'salad',
      'soup',
      'pasta',
      'rice',
      'bread',
      'meat',
      'chicken',
      'beef',
      'fish',
      'vegetable',
      'fruit',
      'cake',
      'dessert',

      // Food-related items (medium relevance)
      'plate',
      'bowl',
      'cup',
      'glass',
      'fork',
      'spoon',
      'knife',
      'dining',
      'kitchen',
      'restaurant',
      'table',
      'drink',
      'beverage',

      // Context items (low relevance)
      'cooking',
      'eating',
      'dinner',
      'lunch',
      'breakfast',
      'snack',
    ]

    const normalizedLabel = label.toLowerCase()

    // Check for direct food matches
    const highRelevanceWords = foodKeywords.slice(0, 21)
    for (const keyword of highRelevanceWords) {
      if (normalizedLabel.includes(keyword)) {
        return 1.0
      }
    }

    // Check for medium relevance
    const mediumRelevanceWords = foodKeywords.slice(21, 33)
    for (const keyword of mediumRelevanceWords) {
      if (normalizedLabel.includes(keyword)) {
        return 0.7
      }
    }

    // Check for low relevance
    const lowRelevanceWords = foodKeywords.slice(33)
    for (const keyword of lowRelevanceWords) {
      if (normalizedLabel.includes(keyword)) {
        return 0.3
      }
    }

    return 0
  }

  private extractFoodFromText(text: string): string {
    const commonFoods = [
      'pizza',
      'burger',
      'hamburger',
      'sandwich',
      'salad',
      'pasta',
      'rice',
      'chicken',
      'fish',
      'beef',
      'soup',
      'bread',
      'cake',
      'curry',
      'noodles',
      'sushi',
      'tacos',
      'burrito',
    ]

    const lowerText = text.toLowerCase()

    for (const food of commonFoods) {
      if (lowerText.includes(food)) {
        return food
      }
    }

    return 'mixed meal'
  }
}

// Factory function
export const createGoogleVisionInference = (apiKey: string) => {
  return new GoogleVisionInference(apiKey)
}
