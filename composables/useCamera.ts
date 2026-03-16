import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useCamera() {
  const stream = ref<MediaStream | null>(null)
  const isStreaming = ref(false)
  const error = ref<string | null>(null)

  const startCamera = async (
    videoRef: Ref<HTMLVideoElement | null>,
    constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }
  ): Promise<void> => {
    error.value = null
    try {
      stream.value = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.value && stream.value) {
        videoRef.value.srcObject = stream.value
        isStreaming.value = true
      }
    } catch {
      error.value = 'Unable to access camera. Please allow camera permissions.'
      isStreaming.value = false
    }
  }

  const stopCamera = (): void => {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
      stream.value = null
    }
    isStreaming.value = false
  }

  onUnmounted(() => {
    stopCamera()
  })

  return {
    stream,
    isStreaming,
    error,
    startCamera,
    stopCamera,
  }
}
