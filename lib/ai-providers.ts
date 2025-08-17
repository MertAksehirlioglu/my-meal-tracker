/**
 * Unified AI Provider Interface
 * Manages multiple AI services with fallback strategies
 */

import { createTensorFlowInference } from './tensorflow'
import { createOpenAIInference } from './openai'
import { createGoogleVisionInference } from './google-vision'

export interface AIProvider {
  name: string
  classifyImage(
    _imageFile: File
  ): Promise<Array<{ label: string; score: number }>>
}

export type ProviderType = 'tensorflow' | 'openai' | 'google-vision' | 'manual'

export class UnifiedAIManager {
  private providers: Map<ProviderType, AIProvider> = new Map()
  private providerOrder: ProviderType[] = []

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Strategy 1: TensorFlow.js (Local, Free, Private)
    const tfProvider: AIProvider = {
      name: 'TensorFlow.js (Local)',
      classifyImage: (file: File) =>
        createTensorFlowInference().classifyImage(file),
    }
    this.providers.set('tensorflow', tfProvider)

    // Strategy 2: OpenAI Vision (High Accuracy, Paid)
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (openaiKey) {
      const openaiProvider: AIProvider = {
        name: 'OpenAI Vision',
        classifyImage: (file: File) =>
          createOpenAIInference(openaiKey).classifyImage(file),
      }
      this.providers.set('openai', openaiProvider)
    }

    // Strategy 3: Google Vision (Good Accuracy, Paid)
    const googleKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY
    if (googleKey) {
      const googleProvider: AIProvider = {
        name: 'Google Vision',
        classifyImage: (file: File) =>
          createGoogleVisionInference(googleKey).classifyImage(file),
      }
      this.providers.set('google-vision', googleProvider)
    }

    // Set provider priority order
    this.setProviderOrder()
  }

  private setProviderOrder() {
    // Prefer local TensorFlow.js first (free, private, fast)
    // Then cloud services for better accuracy if keys are available
    this.providerOrder = ['tensorflow']

    if (this.providers.has('openai')) {
      this.providerOrder.push('openai')
    }

    if (this.providers.has('google-vision')) {
      this.providerOrder.push('google-vision')
    }

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
    const allProviders: ProviderType[] = [
      'tensorflow',
      'openai',
      'google-vision',
    ]

    return allProviders.map((type) => ({
      type,
      name: this.providers.get(type)?.name || `${type} (not configured)`,
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
