<template>
  <v-container
    class="d-flex align-center justify-center"
    style="min-height: 100vh"
  >
    <v-card max-width="400" class="pa-6">
      <div class="text-center mb-4">
        <img
          src="/logo.png"
          alt="MealSnap Logo"
          class="mb-3"
          style="max-width: 48px; max-height: 48px; border-radius: 8px"
        />
        <h1 class="text-h4 font-weight-bold text-primary mb-2">MealSnap</h1>
        <p class="text-grey-darken-1">
          {{ signupDisabled ? 'Portfolio Demo' : 'Create Account' }}
        </p>
      </div>

      <div v-if="signupDisabled">
        <v-alert type="info" class="mb-4">
          New signups are disabled. This is a demo deployment.
        </v-alert>

        <v-btn
          :loading="loading"
          color="primary"
          variant="outlined"
          block
          class="mb-3"
          @click="onDemoLogin"
        >
          <v-icon class="mr-2">mdi-account-eye</v-icon>
          Try Demo Mode
        </v-btn>

        <div class="d-flex ga-2">
          <v-btn
            variant="outlined"
            color="primary"
            size="small"
            prepend-icon="mdi-image-multiple"
            style="flex: 1"
            @click="viewScreenshots"
          >
            Screenshots
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            size="small"
            prepend-icon="mdi-email"
            style="flex: 1"
            @click="contactDeveloper"
          >
            Contact
          </v-btn>
        </div>
      </div>

      <v-form v-else @submit.prevent="onSubmit">
        <v-text-field
          v-model="name"
          label="Name"
          color="primary"
          :rules="[(v) => !!v || 'Name is required']"
          class="mb-3"
        />
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          color="primary"
          :rules="[
            (v) => !!v || 'Email is required',
            (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
          ]"
          class="mb-3"
        />
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          color="primary"
          :rules="[
            (v) => !!v || 'Password is required',
            (v) => v.length >= 6 || 'Password must be at least 6 characters',
          ]"
          class="mb-4"
        />
        <v-btn
          :loading="loading"
          :disabled="!formValid"
          color="primary"
          block
          type="submit"
        >
          Sign Up
        </v-btn>
        <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
        <v-alert v-if="success" type="success" class="mt-3">
          Account created! Check your email to confirm.
        </v-alert>
      </v-form>

      <div class="text-center mt-4">
        <span class="text-grey-darken-1">Already have an account? </span>
        <v-btn variant="text" color="primary" @click="goToLogin">Login</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const name = ref('')
const email = ref('')
const password = ref('')
const formValid = ref(true)
const success = ref(false)
const router = useRouter()
const { register, updateProfile, loginDemo, loading, error } = useAuth()

const config = useRuntimeConfig()
const signupDisabled = computed(() => config.public.signupDisabled)

async function onSubmit() {
  success.value = false
  const { error: regError } = await register(email.value, password.value)
  if (!regError) {
    await updateProfile({ name: name.value })
    success.value = true
    setTimeout(() => router.push('/home'), 2000)
  }
}

async function onDemoLogin() {
  const { error: loginError } = await loginDemo()
  if (!loginError) {
    router.push('/home')
  }
}

function goToLogin() {
  router.push('/login')
}

function viewScreenshots() {
  window.open(
    'https://github.com/mertaksehirlioglu/my-meal-tracker#screenshots',
    '_blank'
  )
}

function contactDeveloper() {
  const subject = 'MealSnap Demo Request'
  const body = 'Hi, I would like to request access to the MealSnap demo.'
  window.open(
    `mailto:mertaksehirlioglu@hotmail.com?subject=${subject}&body=${body}`
  )
}
</script>
