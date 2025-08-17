import { InferenceClient } from '@huggingface/inference'

interface HuggingFaceResponse {
  label: string
  score: number
}

interface HuggingFaceConfig {
  token: string
  model: string
}

export class HuggingFaceInference {
  private client: InferenceClient
  private model: string

  constructor(config: HuggingFaceConfig) {
    if (!config.token) {
      throw new Error('Hugging Face token is required')
    }
    this.client = new InferenceClient(config.token)
    this.model = config.model
  }

  async classifyImage(imageFile: File): Promise<HuggingFaceResponse[]> {
    if (!this.client) {
      throw new Error('Hugging Face client not configured')
    }

    if (!imageFile || imageFile.size === 0) {
      throw new Error('Invalid image file provided')
    }

    // Validate image type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Check file size (limit to 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('Image file too large (max 10MB)')
    }

    try {
      console.log(
        `Sending image classification request for ${imageFile.name} (${imageFile.size} bytes, type: ${imageFile.type})`
      )

      // Convert image to proper format for the API
      let processedFile = imageFile

      // Convert to JPEG if it's not already a supported format
      if (
        !['image/jpeg', 'image/jpg', 'image/png'].includes(
          imageFile.type.toLowerCase()
        )
      ) {
        processedFile = await this.convertToJPEG(imageFile)
      }

      // Convert File to Blob first, then to ArrayBuffer
      const blob = new Blob([processedFile], { type: processedFile.type })
      const data = await blob.arrayBuffer()

      console.log(
        `Processed image: ${processedFile.type}, ${data.byteLength} bytes`
      )

      const output = await this.client.imageClassification({
        data,
        model: this.model,
      })

      console.log('Hugging Face API response:', output)

      // Convert the output to our expected format
      if (!Array.isArray(output)) {
        throw new Error('Unexpected response format from Hugging Face API')
      }

      return output
    } catch (error) {
      console.error('Hugging Face API error:', error)

      if (error instanceof Error) {
        if (error.message.includes('503')) {
          throw new Error('Model is loading, please try again in a few moments')
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Invalid Hugging Face API token')
        }
        if (
          error.message.includes('NoneType') ||
          error.message.includes('Bad Request')
        ) {
          throw new Error(
            'Image format not supported. Try taking a new photo with better lighting.'
          )
        }
        if (error.message.includes('400')) {
          throw new Error('Invalid image format. Please try a different image.')
        }
        throw new Error(`Classification failed: ${error.message}`)
      }

      throw new Error('Unknown error occurred during classification')
    }
  }

  private async convertToJPEG(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width
        canvas.height = img.height

        // Draw image on canvas
        ctx?.drawImage(img, 0, 0)

        // Convert to JPEG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const jpegFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'),
                {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                }
              )
              resolve(jpegFile)
            } else {
              reject(new Error('Failed to convert image to JPEG'))
            }
          },
          'image/jpeg',
          0.8
        )
      }

      img.onerror = () =>
        reject(new Error('Failed to load image for conversion'))
      img.src = URL.createObjectURL(file)
    })
  }
}

// Factory function for creating HuggingFace instance
export const createHuggingFaceInference = (modelName?: string) => {
  const token = import.meta.env.VITE_HUGGING_FACE_TOKEN

  if (!token) {
    console.warn('VITE_HUGGING_FACE_TOKEN not found in environment variables')
  }

  // Try different models in order of reliability
  const defaultModel = modelName || 'microsoft/resnet-50'

  return new HuggingFaceInference({ token, model: defaultModel })
}

// Create specialized food inference with fallback models
export const createFoodClassificationInference = () => {
  const token = import.meta.env.VITE_HUGGING_FACE_TOKEN

  if (!token) {
    console.warn('VITE_HUGGING_FACE_TOKEN not found in environment variables')
  }

  // Try google/vit-base-patch16-224 which is known to work well with HF Inference API
  return new HuggingFaceInference({
    token,
    model: 'google/vit-base-patch16-224',
  })
}

// Alternative inference for testing different models
export const createAlternativeInference = (modelName: string) => {
  const token = import.meta.env.VITE_HUGGING_FACE_TOKEN
  return new HuggingFaceInference({ token, model: modelName })
}
