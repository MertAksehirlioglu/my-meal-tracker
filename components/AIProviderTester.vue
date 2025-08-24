<template>
  <v-card class="pa-6" max-width="800" elevation="8" rounded="xl">
    <v-card-title class="text-h5 text-center mb-4">
      🤖 AI Provider Test Suite
    </v-card-title>

    <v-alert type="info" class="mb-4">
      Test all available AI providers to find the best working solution for food
      classification.
    </v-alert>

    <!-- Test Image Upload -->
    <v-file-input
      v-model="testImage"
      label="Upload test food image"
      accept="image/*"
      prepend-icon="mdi-camera"
      color="primary"
      class="mb-4"
      @change="onImageSelect"
    />

    <div v-if="imagePreview" class="text-center mb-4">
      <img
        :src="imagePreview"
        alt="Test image"
        style="max-width: 100%; max-height: 200px; border-radius: 8px"
      />
    </div>

    <!-- Provider Status -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h3 class="mb-3">Available Providers:</h3>
        <v-chip
          v-for="provider in availableProviders"
          :key="provider.type"
          :color="provider.available ? 'success' : 'error'"
          :variant="provider.available ? 'flat' : 'outlined'"
          class="ma-1"
        >
          <v-icon left>{{
            provider.available ? 'mdi-check-circle' : 'mdi-close-circle'
          }}</v-icon>
          {{ provider.name }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- Test Controls -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6">
        <v-btn
          :disabled="!testImage || testingAll"
          :loading="testingAll"
          color="primary"
          block
          size="large"
          @click="testAllProviders"
        >
          🧪 Test All Providers
        </v-btn>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn
          :disabled="!testImage || testingUnified"
          :loading="testingUnified"
          color="secondary"
          block
          size="large"
          @click="testUnifiedClassification"
        >
          🚀 Test Unified Classification
        </v-btn>
      </v-col>
    </v-row>

    <!-- Individual Provider Tests -->
    <v-row class="mb-4">
      <v-col
        v-for="provider in availableProviders"
        :key="provider.type"
        cols="12"
        sm="4"
      >
        <v-btn
          v-if="provider.available"
          :disabled="!testImage || testingProviders[provider.type]"
          :loading="testingProviders[provider.type]"
          :color="getProviderColor(provider.type)"
          variant="outlined"
          block
          @click="testSingleProvider(provider.type)"
        >
          Test {{ provider.name }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Results -->
    <div v-if="testResults.length > 0">
      <v-divider class="mb-4" />
      <h3 class="mb-3">Test Results:</h3>

      <v-card
        v-for="result in testResults"
        :key="result.provider"
        class="mb-3"
        :color="result.success ? 'success' : 'error'"
        variant="outlined"
      >
        <v-card-text>
          <div class="d-flex justify-space-between align-center mb-2">
            <h4>{{ result.provider }}</h4>
            <v-chip :color="result.success ? 'success' : 'error'" size="small">
              {{ result.success ? '✅ Success' : '❌ Failed' }}
            </v-chip>
          </div>

          <div v-if="result.success && result.predictions">
            <p class="text-caption mb-2">Duration: {{ result.duration }}ms</p>
            <div
              v-for="pred in result.predictions.slice(0, 3)"
              :key="pred.label"
              class="mb-1"
            >
              <v-chip size="small" class="mr-2"
                >{{ (pred.score * 100).toFixed(1) }}%</v-chip
              >
              {{ formatFoodName(pred.label) }}
            </div>
          </div>

          <p v-if="!result.success" class="text-error">{{ result.error }}</p>
        </v-card-text>
      </v-card>
    </div>

    <!-- Recommendations -->
    <div v-if="recommendations.length > 0">
      <v-divider class="mb-4" />
      <v-alert type="success" class="mb-4">
        <h4 class="mb-2">🎯 Recommendations:</h4>
        <ul>
          <li v-for="rec in recommendations" :key="rec">{{ rec }}</li>
        </ul>
      </v-alert>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAIManager } from '@/lib/ai-providers'
import type { ProviderType } from '@/lib/ai-providers'

const aiManager = getAIManager()

// State
const testImage = ref<File[]>([])
const imagePreview = ref<string | null>(null)
const testingAll = ref(false)
const testingUnified = ref(false)
const testingProviders = ref<Record<string, boolean>>({})
const availableProviders = ref<
  Array<{ type: ProviderType; name: string; available: boolean }>
>([])
const testResults = ref<
  Array<{
    provider: string
    success: boolean
    predictions?: Array<{ label: string; score: number }>
    error?: string
    duration?: number
  }>
>([])
const recommendations = ref<string[]>([])

onMounted(() => {
  availableProviders.value = aiManager.getAvailableProviders()
  console.log('Available providers:', availableProviders.value)
})

const onImageSelect = (files: File[]) => {
  if (files.length > 0) {
    const file = files[0]
    imagePreview.value = URL.createObjectURL(file)
    testResults.value = []
    recommendations.value = []
  }
}

const testAllProviders = async () => {
  if (!testImage.value[0]) return

  testingAll.value = true
  testResults.value = []

  try {
    for (const provider of availableProviders.value) {
      if (!provider.available) continue

      const result = await aiManager.testProvider(
        provider.type,
        testImage.value[0]
      )
      testResults.value.push(result)
    }

    generateRecommendations()
  } catch (error) {
    console.error('Test suite failed:', error as Error)
  } finally {
    testingAll.value = false
  }
}

const testSingleProvider = async (providerType: ProviderType) => {
  if (!testImage.value[0]) return

  testingProviders.value[providerType] = true

  try {
    const result = await aiManager.testProvider(
      providerType,
      testImage.value[0]
    )

    // Update or add result
    const existingIndex = testResults.value.findIndex(
      (r) => r.provider === result.provider
    )
    if (existingIndex >= 0) {
      testResults.value[existingIndex] = result
    } else {
      testResults.value.push(result)
    }

    generateRecommendations()
  } catch (error) {
    console.error(`Test for ${providerType} failed:`, error as Error)
  } finally {
    testingProviders.value[providerType] = false
  }
}

const testUnifiedClassification = async () => {
  if (!testImage.value[0]) return

  testingUnified.value = true

  try {
    const result = await aiManager.classifyImage(testImage.value[0])

    testResults.value.push({
      provider: `Unified (${result.provider})`,
      success: result.success,
      predictions: result.predictions,
      duration: undefined,
    })

    generateRecommendations()
  } catch (error) {
    testResults.value.push({
      provider: 'Unified Classification',
      success: false,
      error: (error as Error).message,
    })
  } finally {
    testingUnified.value = false
  }
}

const generateRecommendations = () => {
  const successful = testResults.value.filter((r) => r.success)
  const failed = testResults.value.filter((r) => !r.success)

  recommendations.value = []

  if (successful.length > 0) {
    const fastest = successful.reduce((prev, curr) =>
      curr.duration && prev.duration && curr.duration < prev.duration
        ? curr
        : prev
    )

    if (fastest.provider.includes('TensorFlow')) {
      recommendations.value.push(
        '✅ TensorFlow.js is working! Use it for free, local processing'
      )
    }

    // Using only TensorFlow.js for local processing

    recommendations.value.push(
      `⚡ Fastest provider: ${fastest.provider} (${fastest.duration}ms)`
    )
  }

  if (failed.length > 0) {
    recommendations.value.push(
      `⚠️ ${failed.length} provider(s) failed - check browser compatibility`
    )
  }

  if (successful.length === 0) {
    recommendations.value.push(
      '❌ No providers working - use manual entry fallback'
    )
    recommendations.value.push('💡 TensorFlow.js models may need time to download')
  }
}

const getProviderColor = (type: ProviderType) => {
  const colors: Record<string, string> = {
    tensorflow: 'orange',
    manual: 'grey',
  }
  return colors[type] || 'grey'
}

const formatFoodName = (label: string): string => {
  return label.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
</script>
