<template>
  <v-container class="d-flex flex-column align-center justify-center text-center">
    <img
      src="/logo.png"
      alt="MealSnap Logo"
      class="mb-4"
      style="max-width: 64px; max-height: 64px; border-radius: 12px; box-shadow: 0 2px 8px rgba(67,160,71,0.15);"
    />
    <h1 class="font-weight-bold mb-6" style="color: #43A047; letter-spacing: 1px;">MealSnap</h1>
    <v-card class="pa-6 mx-auto" max-width="400" elevation="8" style="border-radius: 18px;">
      <h2 class="font-weight-bold mb-4" style="color: #43A047;">Login to MealSnap</h2>
      <v-form @submit.prevent="onSubmit" ref="formRef" v-model="formValid">
        <v-text-field 
          v-model="email" 
          @input="resetError" 
          label="Email" 
          type="email" 
          required 
          class="mb-3" 
          color="primary"
          :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
        />
        <v-text-field 
          v-model="password" 
          @input="resetError" 
          label="Password" 
          type="password" 
          required 
          class="mb-4" 
          color="primary"
          :rules="[v => !!v || 'Password is required']"
        />
        <v-btn 
          :disabled="!formValid || loading" 
          color="primary" 
          block 
          size="large" 
          type="submit"
        >
          <v-progress-circular v-if="loading" indeterminate color="white" size="20" class="mr-2" />
          Login
        </v-btn>
        <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
      </v-form>
      <v-divider class="my-4" />
      <div class="text-center">
        <span class="text-grey-darken-1">Don't have an account?</span>
        <v-btn variant="text" color="primary" @click="goToSignup" class="ml-1">Sign Up</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const email = ref('')
const password = ref('')
const formValid = ref(false)
const formRef = ref()
const router = useRouter()
const { login, loading, error } = useAuth()

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
</script>
