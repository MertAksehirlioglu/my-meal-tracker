<template>
  <v-snackbar
    v-model="showError"
    :color="errorColor"
    :timeout="errorType === 'error' ? -1 : 6000"
    location="top center"
    multi-line
    rounded="lg"
    elevation="8"
  >
    <div class="d-flex align-center">
      <v-icon :icon="errorIcon" class="mr-3" />
      <div class="flex-grow-1">
        <div class="font-weight-medium">{{ errorMessage }}</div>
        <div v-if="errorType === 'error'" class="text-caption mt-1 opacity-80">
          {{ formatErrorTime(errorTimestamp) }}
        </div>
      </div>
    </div>

    <template #actions>
      <div class="d-flex gap-2">
        <v-btn
          v-if="retryable && onRetry"
          variant="text"
          size="small"
          @click="handleRetry"
        >
          Retry
        </v-btn>
        <v-btn variant="text" size="small" @click="handleClose"> Close </v-btn>
      </div>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ErrorState } from '~/composables/useErrorHandling'

interface Props {
  error: ErrorState | null
  retryable?: boolean
}

interface Emits {
  (_event: 'close' | 'retry'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showError = computed({
  get: () => !!props.error,
  set: (value: boolean) => {
    if (!value) {
      emit('close')
    }
  },
})

const errorMessage = computed(() => props.error?.message || '')
const errorType = computed(() => props.error?.type || 'error')
const errorTimestamp = computed(() => props.error?.timestamp || Date.now())
const retryable = computed(() => props.retryable && props.error?.retryable)

const errorColor = computed(() => {
  switch (errorType.value) {
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'error'
  }
})

const errorIcon = computed(() => {
  switch (errorType.value) {
    case 'warning':
      return 'mdi-alert'
    case 'info':
      return 'mdi-information'
    default:
      return 'mdi-alert-circle'
  }
})

const onRetry = computed(() => props.retryable)

const formatErrorTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const handleClose = () => {
  emit('close')
}

const handleRetry = () => {
  emit('retry')
  emit('close')
}
</script>
