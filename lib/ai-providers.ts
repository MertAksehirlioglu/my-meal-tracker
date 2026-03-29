/**
 * Unified AI Provider Interface
 * Manages TensorFlow.js local inference
 */

// NOTE: tensorflow.ts is intentionally NOT statically imported here.
// It is dynamically imported on first use so the TF module (and its
// dynamic @tensorflow/* imports) only load on the snap page.

export interface AIProvider {
  name: string
  classifyImage(
    _imageFile: File
  ): Promise<Array<{ label: string; score: number }>>
}

export type ProviderType = 'tensorflow' | 'huggingface' | 'manual'

export class UnifiedAIManager {
  private providers: Map<ProviderType, AIProvider> = new Map()
  private providerOrder: ProviderType[] = []

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // TensorFlow.js (Local, Free, Private)
    // createTensorFlowInference is loaded lazily via dynamic import so the
    // entire tensorflow module (and its @tensorflow/* dynamic imports) are
    // excluded from the initial bundle and only fetched on the snap page.
    const tfProvider: AIProvider = {
      name: 'TensorFlow.js (Local)',
      classifyImage: async (file: File) => {
        const { createTensorFlowInference } = await import('./tensorflow')
        return createTensorFlowInference().classifyImage(file)
      },
    }
    this.providers.set('tensorflow', tfProvider)

    // HuggingFace (Cloud, requires VITE_HUGGING_FACE_TOKEN)
    // Registered as a second-priority fallback for foods the local model misses.
    // The module is dynamically imported so it never loads when the token is absent.
    if (import.meta.env.VITE_HUGGING_FACE_TOKEN) {
      const hfProvider: AIProvider = {
        name: 'HuggingFace (Cloud)',
        classifyImage: async (file: File) => {
          const { createFoodClassificationInference } = await import(
            './huggingface'
          )
          return createFoodClassificationInference().classifyImage(file)
        },
      }
      this.providers.set('huggingface', hfProvider)
    }

    // Set provider priority order
    this.setProviderOrder()
  }

  private setProviderOrder() {
    const order: ProviderType[] = ['tensorflow']

    // Include HuggingFace only when its token is present
    if (this.providers.has('huggingface')) {
      order.push('huggingface')
    }

    this.providerOrder = order

    console.log(
      '🤖 AI Provider order:',
      this.providerOrder.map((p) => this.providers.get(p)?.name)
    )
  }

  async classifyImage(imageFile: File): Promise<{
    predictions: Array<{ label: string; score: number }>
    provider: string
    success: boolean
  }> {
    const errors: string[] = []

    // Try each provider in order
    for (const providerType of this.providerOrder) {
      const provider = this.providers.get(providerType)
      if (!provider) continue

      try {
        console.log(`🧪 Trying ${provider.name}...`)

        const startTime = Date.now()
        const predictions = await provider.classifyImage(imageFile)
        const duration = Date.now() - startTime

        console.log(
          `✅ ${provider.name} succeeded in ${duration}ms:`,
          predictions
        )

        if (predictions && predictions.length > 0) {
          return {
            predictions,
            provider: provider.name,
            success: true,
          }
        }
      } catch (error) {
        const errorMsg = `${provider.name}: ${(error as Error).message}`
        errors.push(errorMsg)
        console.warn(`❌ ${errorMsg}`)
        continue
      }
    }

    // All providers failed
    console.error('All AI providers failed:', errors)
    throw new Error(`All AI services failed:\n${errors.join('\n')}`)
  }

  getAvailableProviders(): Array<{
    type: ProviderType
    name: string
    available: boolean
  }> {
    const allProviders: ProviderType[] = ['tensorflow', 'huggingface']

    return allProviders.map((type) => ({
      type,
      name: this.providers.get(type)?.name || `${type} (not available)`,
      available: this.providers.has(type),
    }))
  }

  async testProvider(
    providerType: ProviderType,
    testImageFile: File
  ): Promise<{
    success: boolean
    provider: string
    predictions?: Array<{ label: string; score: number }>
    error?: string
    duration?: number
  }> {
    const provider = this.providers.get(providerType)
    if (!provider) {
      return {
        success: false,
        provider: `${providerType} (not available)`,
        error: 'Provider not configured',
      }
    }

    try {
      console.log(`🧪 Testing ${provider.name}...`)

      const startTime = Date.now()
      const predictions = await provider.classifyImage(testImageFile)
      const duration = Date.now() - startTime

      return {
        success: true,
        provider: provider.name,
        predictions,
        duration,
      }
    } catch (error) {
      return {
        success: false,
        provider: provider.name,
        error: (error as Error).message,
      }
    }
  }
}

// Global instance
let aiManager: UnifiedAIManager | null = null

export const getAIManager = (): UnifiedAIManager => {
  if (!aiManager) {
    aiManager = new UnifiedAIManager()
  }
  return aiManager
}

// Convenience function for the existing food classification interface
export const createUnifiedInference = () => {
  const manager = getAIManager()

  return {
    async classifyImage(imageFile: File) {
      const result = await manager.classifyImage(imageFile)
      return result.predictions
    },
  }
}
