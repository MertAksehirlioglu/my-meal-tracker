<template>
  <v-container
    class="d-flex flex-column align-center justify-center text-center"
  >
    <img
      src="/logo.png"
      alt="MealSnap Logo"
      class="mb-4"
      style="max-width: 64px; max-height: 64px; border-radius: 12px"
    />
    <h1 class="font-weight-bold mb-6" style="letter-spacing: 1px">MealSnap</h1>
    <v-card
      class="pa-6"
      max-width="400"
      elevation="8"
      style="border-radius: 18px"
    >
      <v-card-title class="font-weight-bold text-center">
        Login to MealSnap
      </v-card-title>
      <v-form ref="formRef" v-model="formValid" @submit.prevent="onSubmit">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          required
          color="primary"
          :rules="[
            (v) => !!v || 'Email is required',
            (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
          ]"
          @input="resetError"
        />
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          required
          color="primary"
          :rules="[(v) => !!v || 'Password is required']"
          @input="resetError"
        />
        <div class="text-left mb-4">
          <v-btn
            variant="text"
            color="primary"
            size="small"
            @click="goToForgotPassword"
          >
            Forgot Password?
          </v-btn>
        </div>
        <v-btn
          :disabled="!formValid || loading"
          color="primary"
          block
          size="large"
          type="submit"
        >
          <v-progress-circular
            v-if="loading"
            indeterminate
            color="white"
            size="20"
            class="mr-2"
          />
          Login
        </v-btn>
        <v-divider class="my-4" />
        <div v-if="!signupDisabled" class="mb-4 text-center">
          New here? Create an account to get started!
        </div>
        <v-btn
          v-if="!signupDisabled"
          color="primary"
          block
          size="large"
          @click="goToSignup"
        >
          Sign Up Now
        </v-btn>
        <v-card-text v-else class="text-center">
          <v-alert
            type="info"
            variant="tonal"
            class="mb-3"
            icon="mdi-information"
            density="compact"
          >
            <v-alert-title class="text-body-2">This is a portfolio demo. New signups are disabled.</v-alert-title>
          </v-alert>
          <v-card-subtitle class="text-grey-darken-2 mb-2">For demo access, contact:</v-card-subtitle>
          <v-chip
            color="primary"
            variant="outlined"
            prepend-icon="mdi-email"
            size="small"
            @click="contactDeveloper"
          >
            mertaksehirlioglu@hotmail.com
          </v-chip>
        </v-card-text>
        <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const email = ref('')
const password = ref('')
const formValid = ref(false)
const formRef = ref()
const router = useRouter()
const { login, loading, error } = useAuth()

const config = useRuntimeConfig()
const signupDisabled = computed(() => config.public.signupDisabled)

const resetError = () => {
  if (error.value) error.value = null
}

async function onSubmit() {
  if (!formRef.value?.validate()) return

  const { error: loginError } = await login(email.value, password.value)
  if (!loginError) {
    // Redirect to home page on successful login
    router.push('/home')
  }
}

function goToSignup() {
  router.push('/signup')
}

function goToForgotPassword() {
  router.push('/forgot-password')
}

function contactDeveloper() {
  const subject = encodeURIComponent(
    'MealSnap Portfolio Demo - Test User Request'
  )
  const body = encodeURIComponent(
    'Hi Mert,\n\nI would like to request a test user account for your MealSnap portfolio application.\n\nThank you!'
  )
  window.open(
    `mailto:mertaksehirlioglu@hotmail.com?subject=${subject}&body=${body}`
  )
}
</script>
