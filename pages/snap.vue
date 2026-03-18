<template>
  <v-container
    class="fill-height d-flex flex-column align-center justify-center"
  >
    <!-- Camera/Photo Capture Phase -->
    <v-card
      v-if="!showAnalysis"
      class="pa-6 py-8 mx-auto"
      max-width="400"
      elevation="10"
      rounded="xl"
    >
      <div class="d-flex flex-column align-center mb-4">
        <img
          src="/logo.png"
          alt="MealSnap Logo"
          class="mb-2"
          style="max-width: 48px; max-height: 48px; border-radius: 8px"
        />
        <h2 class="font-weight-bold mb-2 text-primary">Snap a Meal Photo</h2>
        <p class="mb-2 text-grey-darken-1 text-center">
          Point your camera at your meal and tap the button to take a photo.
        </p>
      </div>

      <div class="d-flex flex-column align-center justify-center mb-4">
        <video
          v-show="!photoData"
          ref="videoRef"
          autoplay
          playsinline
          style="
            width: 100%;
            max-width: 320px;
            border-radius: 12px;
            background: #eee;
          "
        />
        <img
          v-if="photoData"
          :src="photoData"
          alt="Captured photo"
          style="width: 100%; max-width: 320px; border-radius: 12px"
        />
      </div>

      <v-btn
        v-if="!photoData"
        color="primary"
        block
        size="large"
        class="mb-2"
        :disabled="!cameraReady"
        @click="takePhoto"
      >
        <v-icon left>mdi-camera</v-icon>
        Take Photo
      </v-btn>

      <div v-if="photoData" class="d-flex flex-column gap-2 mb-4">
        <v-btn
          color="primary"
          block
          size="large"
          :loading="analyzing || classificationLoading"
          :disabled="analyzing || classificationLoading"
          @click="analyzePhoto"
        >
          <v-icon left>mdi-robot</v-icon>
          Analyze with AI
        </v-btn>

        <v-btn
          color="secondary"
          variant="outlined"
          block
          size="large"
          :disabled="analyzing || classificationLoading"
          @click="retakePhoto"
        >
          <v-icon left>mdi-refresh</v-icon>
          Retake Photo
        </v-btn>
      </div>

      <v-divider class="my-4" />

      <!-- [Feature] Gallery upload fallback -->
      <input
        ref="galleryInputRef"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onGalleryFileSelected"
      />
      <v-btn
        color="secondary"
        variant="outlined"
        block
        size="large"
        class="mb-2"
        @click="openGallery"
      >
        <v-icon left>mdi-image</v-icon>
        Upload from Gallery
      </v-btn>

      <v-btn
        color="grey"
        variant="outlined"
        block
        size="large"
        @click="goToManualEntry"
      >
        <v-icon left>mdi-pencil</v-icon>
        Add Manually
      </v-btn>

      <v-alert
        v-if="error || analysisError || classificationError"
        type="error"
        class="mt-2"
      >
        {{ error || analysisError || classificationError || '' }}
        <div class="mt-3">
          <v-btn
            color="white"
            variant="outlined"
            size="small"
            @click="showManualEntry"
          >
            Enter Food Manually Instead
          </v-btn>
        </div>
      </v-alert>
    </v-card>

    <!-- Analysis Results and Review Phase -->
    <div
      v-if="showAnalysis && analysisResult"
      class="w-100"
      style="max-width: 800px"
    >
      <AnalyzedMealReview
        :analysis-result="analysisResult"
        :photo-url="photoData || undefined"
        :loading="saving || errorHandlingLoading"
        @save="(payload: unknown) => saveMeal(payload as CreateMeal)"
        @cancel="goBackToCamera"
      />
    </div>

    <!-- Analysis Loading Overlay -->
    <v-overlay v-model="analyzing" class="d-flex align-center justify-center">
      <v-card class="pa-6 text-center" elevation="8" rounded="lg">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          class="mb-4"
        />
        <h3 class="text-h6 mb-2">Analyzing your meal...</h3>
        <p class="text-grey-darken-1">
          Our AI is identifying the food and estimating nutrition.
        </p>
      </v-card>
    </v-overlay>

    <!-- Saving Loading Overlay -->
    <v-overlay v-model="saving" class="d-flex align-center justify-center">
      <v-card class="pa-6 text-center" elevation="8" rounded="lg">
        <v-progress-circular
          indeterminate
          color="success"
          size="64"
          class="mb-4"
        />
        <h3 class="text-h6 mb-2">Saving your meal...</h3>
        <p class="text-grey-darken-1">Uploading image and storing meal data.</p>
      </v-card>
    </v-overlay>

    <!-- Error Notifications -->
    <ErrorNotification
      :error="latestError"
      :retryable="false"
      @close="clearError"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOptimizedFoodAnalysis } from '@/composables/useOptimizedFoodAnalysis'
import { useStorage } from '@/composables/useStorage'
import { useAuth } from '@/composables/useAuth'
import { useErrorHandling } from '@/composables/useErrorHandling'
import { useCamera } from '@/composables/useCamera'
import AnalyzedMealReview from '@/components/AnalyzedMealReview.vue'
import ErrorNotification from '@/components/ErrorNotification.vue'
import type { CreateMeal } from '~/server/database/schemas'

// Page meta
definePageMeta({
  middleware: 'auth' as never,
  layout: 'authenticated',
})

const router = useRouter()
const { user } = useAuth()
const {
  isLoading: errorHandlingLoading,
  latestError,
  clearError,
  withErrorHandling,
} = useErrorHandling()
const {
  analyzing,
  analysisError,
  analysisResult,
  isProcessing: classificationLoading,
  analyzeFood,
  resetAnalysis,
  createManualAnalysis,
} = useOptimizedFoodAnalysis()

const classificationError = analysisError

// Non-readonly reference for manual analysis result setting
const _analysisResult = analysisResult as unknown
const { uploadMealImage, compressImage } = useStorage()

// Camera composable
const videoRef = ref<HTMLVideoElement | null>(null)
const {
  stream,
  isStreaming: cameraReady,
  error: cameraError,
  startCamera,
  stopCamera,
} = useCamera()

// Camera and photo state
const photoData = ref<string | null>(null)
const error = ref<string | null>(null)

// UI state
const showAnalysis = ref(false)
const saving = ref(false)

const initCamera = async () => {
  await startCamera(videoRef)
  if (cameraError.value) {
    error.value = cameraError.value
  }
}

onMounted(initCamera)

// Convert data URL to File
function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

function takePhoto() {
  if (!videoRef.value) return

  const video = videoRef.value
  const canvas = document.createElement('canvas')

  // Limit canvas size to reasonable dimensions
  const maxWidth = 1280
  const maxHeight = 720

  let { videoWidth, videoHeight } = video

  // Scale down if too large
  if (videoWidth > maxWidth || videoHeight > maxHeight) {
    const ratio = Math.min(maxWidth / videoWidth, maxHeight / videoHeight)
    videoWidth *= ratio
    videoHeight *= ratio
  }

  canvas.width = videoWidth
  canvas.height = videoHeight

  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
    photoData.value = canvas.toDataURL('image/jpeg', 0.8)
  }
}

async function analyzePhoto() {
  if (!photoData.value) return

  try {
    error.value = null
    resetAnalysis()

    // Convert photo data to File
    const photoFile = dataURLtoFile(photoData.value, 'meal-photo.jpg')

    // Analyze the food
    await analyzeFood(photoFile)

    // Show analysis results
    showAnalysis.value = true

    // Stop camera stream since we're moving to analysis phase
    stopCamera()
  } catch (err) {
    console.error('Analysis failed:', err)
    error.value =
      'Failed to analyze the photo. You can try again or add the meal manually.'
  }
}

async function saveMeal(mealPayload: CreateMeal) {
  if (!user.value?.id) return

  const result = await withErrorHandling(
    async () => {
      saving.value = true
      let imageUrl = null

      // Upload photo to storage if available
      if (photoData.value) {
        const photoFile = dataURLtoFile(photoData.value, 'meal-photo.jpg')

        // Compress image before uploading
        const compressedFile = await compressImage(photoFile, 800, 0.8)

        const { error: uploadError, data: imagePath } = await uploadMealImage(
          compressedFile,
          user.value!.id
        )

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError}`)
        }

        if (imagePath) {
          // Get the public URL for the uploaded image
          const { data } = useSupabaseClient()
            .storage.from(
              process.env.SUPABASE_MEAL_IMAGES_BUCKET || 'meal-images'
            )
            .getPublicUrl(imagePath)

          imageUrl = data.publicUrl
        }
      }

      // Save meal with image URL using authenticated fetch
      const { authenticatedFetch } = useAuthenticatedFetch()
      const response = await authenticatedFetch('/api/meals', {
        method: 'POST',
        body: JSON.stringify({
          ...mealPayload,
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save meal: ${response.statusText}`)
      }

      const data = (await response.json()) as {
        success: boolean
        message?: string
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to save meal')
      }

      // Navigate back to home with success
      router.push('/home')
    },
    'saving meal',
    false
  )

  if (result !== null) {
    saving.value = false
  } else {
    saving.value = false
  }
}

function retakePhoto() {
  photoData.value = null
  showAnalysis.value = false
  resetAnalysis()

  // Restart camera if not streaming
  if (!cameraReady.value) {
    initCamera()
  }
}

function goBackToCamera() {
  showAnalysis.value = false
  resetAnalysis()
}

function showManualEntry() {
  // Show a prompt for manual food entry
  const foodName = prompt('Enter the name of the food in the image:')

  if (foodName) {
    try {
      const manualResult = createManualAnalysis(foodName)
      ;(_analysisResult as { value: unknown }).value = manualResult
      showAnalysis.value = true

      // Stop camera stream since we're moving to analysis phase
      stopCamera()
    } catch (err) {
      console.error('Manual entry error:', err)
    }
  }
}

function goToManualEntry() {
  router.push('/add-meal')
}

// [Feature] Gallery upload fallback
const galleryInputRef = ref<HTMLInputElement | null>(null)

function openGallery() {
  galleryInputRef.value?.click()
}

function onGalleryFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    photoData.value = reader.result as string
  }
  reader.readAsDataURL(file)

  // Reset input so same file can be re-selected if needed
  input.value = ''
}
</script>
