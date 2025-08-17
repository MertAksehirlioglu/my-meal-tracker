/**
 * OpenAI Vision API Food Classification Provider
 * Uses GPT-4 Vision to analyze food images with high accuracy
 */

interface OpenAIPrediction {
  label: string
  score: number
}

export class OpenAIInference {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async classifyImage(imageFile: File): Promise<OpenAIPrediction[]> {
    console.log('🤖 OpenAI Vision: Starting food analysis')

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile)

      // Create the prompt for food classification
      const prompt = `You are a nutrition expert. Analyze this food image and provide a JSON response with the following structure:
{
  "predictions": [
    {
      "food_name": "specific food name",
      "confidence": 0.95,
      "description": "brief description"
    }
  ],
  "overall_assessment": "brief overall description of the meal"
}

Focus on identifying:
1. Main food items visible
2. Portion sizes (if possible)
3. Cooking methods
4. Any ingredients you can identify

Be specific (e.g., "grilled chicken breast" not just "chicken").
Rate confidence from 0.0 to 1.0 based on image clarity and your certainty.`

      // Make API call
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini', // More cost-effective vision model
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                      detail: 'low', // Reduce cost
                    },
                  },
                ],
              },
            ],
            max_tokens: 500,
            temperature: 0.3,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`
        )
      }

      const data = await response.json()
      console.log('🤖 OpenAI response:', data)

      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No response from OpenAI Vision API')
      }

      // Parse JSON response
      try {
        const parsed = JSON.parse(content)
        const predictions: OpenAIPrediction[] = []

        if (parsed.predictions && Array.isArray(parsed.predictions)) {
          parsed.predictions.forEach(
            (pred: { food_name?: string; confidence?: number }) => {
              if (pred.food_name && typeof pred.confidence === 'number') {
                predictions.push({
                  label: pred.food_name.toLowerCase(),
                  score: Math.min(Math.max(pred.confidence, 0), 1), // Clamp 0-1
                })
              }
            }
          )
        }

        // If no structured predictions, try to extract from text
        if (predictions.length === 0) {
          predictions.push({
            label: this.extractFoodFromText(content),
            score: 0.7, // Medium confidence for text extraction
          })
        }

        console.log('✅ OpenAI Vision parsed predictions:', predictions)
        return predictions
      } catch {
        console.warn(
          'Failed to parse OpenAI JSON response, using text extraction'
        )

        // Fallback: extract food names from text
        const extractedFood = this.extractFoodFromText(content)
        return [
          {
            label: extractedFood,
            score: 0.6,
          },
        ]
      }
    } catch (error) {
      console.error('OpenAI Vision classification error:', error)
      throw new Error(
        `OpenAI Vision analysis failed: ${(error as Error).message}`
      )
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private extractFoodFromText(text: string): string {
    // Simple extraction of food-related words from text
    const commonFoods = [
      'pizza',
      'burger',
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
      'fruit',
      'vegetable',
      'noodles',
      'curry',
      'stir fry',
      'grilled',
      'fried',
      'steamed',
    ]

    const lowerText = text.toLowerCase()

    // Find first mentioned food item
    for (const food of commonFoods) {
      if (lowerText.includes(food)) {
        return food
      }
    }

    // Fallback to mixed meal
    return 'mixed meal'
  }
}

// Factory function
export const createOpenAIInference = (apiKey: string) => {
  return new OpenAIInference(apiKey)
}
