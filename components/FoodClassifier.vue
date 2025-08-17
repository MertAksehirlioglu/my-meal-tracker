<template>
  <v-card
    class="pa-6"
    max-width="500"
    elevation="8"
    style="border-radius: 18px"
  >
    <v-card-title class="font-weight-bold text-center">
      Food Classification
    </v-card-title>

    <v-file-input
      v-model="selectedFile"
      label="Upload food image"
      accept="image/*"
      prepend-icon="mdi-camera"
      color="primary"
      class="mb-4"
      @change="onFileSelect"
    />

    <div v-if="imagePreview" class="text-center mb-4">
      <img
        :src="imagePreview"
        alt="Food preview"
        style="max-width: 100%; max-height: 200px; border-radius: 8px"
      />
    </div>

    <v-btn
      :disabled="!selectedFile || loading || classifying"
      :loading="classifying"
      color="primary"
      block
      size="large"
      @click="classifyImage"
    >
      Classify Food
    </v-btn>

    <v-alert v-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>

    <div v-if="predictions.length > 0" class="mt-4">
      <h3 class="mb-2">Predictions:</h3>
      <v-list>
        <v-list-item v-for="prediction in predictions" :key="prediction.label">
          <v-list-item-content>
            <v-list-item-title>
              {{ formatFoodName(prediction.label) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ (prediction.score * 100).toFixed(1) }}% confidence
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  useFoodClassification,
  type FoodPrediction,
} from '@/composables/useFoodClassification'
import { createFoodClassificationInference } from '@/lib/huggingface'

const hfProvider = createFoodClassificationInference()
const { classifyFood, loading, error, formatFoodName } =
  useFoodClassification(hfProvider)
const selectedFile = ref<File[]>([])
const imagePreview = ref<string | null>(null)
const classifying = ref(false)
const predictions = ref<FoodPrediction[]>([])

const onFileSelect = (files: File[]) => {
  if (files.length > 0) {
    const file = files[0]
    imagePreview.value = URL.createObjectURL(file)
    predictions.value = []
  }
}

const classifyImage = async () => {
  if (!selectedFile.value[0]) return

  try {
    classifying.value = true
    predictions.value = await classifyFood(selectedFile.value[0])
  } catch (err) {
    console.error('Classification error:', err)
  } finally {
    classifying.value = false
  }
}
</script>

<style scoped>
.pa-6 {
  padding: 24px !important;
}
</style>
