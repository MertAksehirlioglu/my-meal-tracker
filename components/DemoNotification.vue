<template>
  <v-snackbar
    v-model="showDemoNotification"
    :timeout="NOTIFICATION_TIMEOUT"
    color="primary"
    variant="elevated"
    location="top"
    multi-line
  >
    <div class="d-flex align-center">
      <v-icon class="mr-3" :icon="DEMO_ICON" aria-hidden="true" />
      <div class="flex-grow-1">
        <div class="font-weight-medium">
          {{ NOTIFICATION_TITLE }}
        </div>
        <div class="text-body-2 mt-1">
          {{ demoNotificationMessage }}
        </div>
      </div>
    </div>

    <template #actions>
      <v-btn
        color="white"
        variant="text"
        size="small"
        :loading="isNavigating"
        @click="handleSignupNavigation"
      >
        Sign Up
      </v-btn>
      <v-btn
        color="white"
        variant="text"
        :icon="CLOSE_ICON"
        size="small"
        aria-label="Close notification"
        @click="handleClose"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface NavigationError extends Error {
  code?: string
}

const NOTIFICATION_TIMEOUT = 6000
const NOTIFICATION_TITLE = 'Demo Mode Restriction'
const DEMO_ICON = 'mdi-test-tube'
const CLOSE_ICON = 'mdi-close'
const SIGNUP_ROUTE = '/signup'

const router = useRouter()
const { showDemoNotification, demoNotificationMessage, closeDemoNotification } =
  useDemoNotification()

const isNavigating = ref(false)

const handleClose = (): void => {
  closeDemoNotification()
}

const handleSignupNavigation = async (): Promise<void> => {
  if (isNavigating.value) return

  try {
    isNavigating.value = true
    closeDemoNotification()

    await router.push(SIGNUP_ROUTE)
  } catch (error) {
    console.error('Navigation error:', error)

    const navigationError = error as NavigationError
    if (navigationError?.code !== 'NAVIGATION_CANCELLED') {
      console.warn('Failed to navigate to signup page')
    }
  } finally {
    isNavigating.value = false
  }
}
</script>
