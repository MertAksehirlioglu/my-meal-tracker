<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-card class="pa-6 py-8 mx-auto" max-width="400" elevation="10" rounded="xl">
      <div class="d-flex flex-column align-center mb-4">
        <img src="/logo.png" alt="MealSnap Logo" class="mb-2" style="max-width: 48px; max-height: 48px; border-radius: 8px;" />
        <h2 class="font-weight-bold mb-2 text-primary">Snap a Meal Photo</h2>
        <p class="mb-2 text-grey-darken-1 text-center">Point your camera at your meal and tap the button to take a photo.</p>
      </div>
      <div class="d-flex flex-column align-center justify-center mb-4">
        <video ref="videoRef" autoplay playsinline style="width: 100%; max-width: 320px; border-radius: 12px; background: #eee;" v-show="!photoData" />
        <img v-if="photoData" :src="photoData" alt="Captured photo" style="width: 100%; max-width: 320px; border-radius: 12px;" />
      </div>
      <v-btn v-if="!photoData" color="primary" block size="large" class="mb-2" @click="takePhoto" :disabled="!cameraReady">
        <v-icon left>mdi-camera</v-icon>
        Take Photo
      </v-btn>
      <v-btn v-if="photoData" color="secondary" block size="large" class="mb-2" @click="retakePhoto">
        <v-icon left>mdi-refresh</v-icon>
        Retake
      </v-btn>
      <v-divider class="my-4"></v-divider>
      <v-btn color="grey" variant="outlined" block size="large" @click="goToManualEntry">
        <v-icon left>mdi-pencil</v-icon>
        Add Manually
      </v-btn>
      <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

// Page meta
definePageMeta({
  middleware: 'auth' as any,
  layout: 'authenticated'
})

const router = useRouter()
const videoRef = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const photoData = ref<string | null>(null)
const error = ref<string | null>(null)
const cameraReady = ref(false)

onMounted(async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    if (videoRef.value && stream.value) {
      videoRef.value.srcObject = stream.value
      cameraReady.value = true
    }
  } catch (e) {
    error.value = 'Unable to access camera. Please allow camera permissions.'
  }
})

onBeforeUnmount(() => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
})

function takePhoto() {
  if (!videoRef.value) return
  const video = videoRef.value
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    photoData.value = canvas.toDataURL('image/png')
  }
}

function retakePhoto() {
  photoData.value = null
}

function goToManualEntry() {
  router.push('/add-meal')
}
</script>
