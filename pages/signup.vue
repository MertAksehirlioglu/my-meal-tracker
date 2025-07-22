<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-card class="pa-8 py-10 mx-auto" max-width="400" elevation="10" rounded="xl">
      <div class="d-flex flex-column align-center mb-6">
        <img src="/logo.png" alt="MealSnap Logo" class="mb-4" style="max-width: 64px; max-height: 64px; border-radius: 12px;" />
        <h1 class="font-weight-bold mb-6 text-primary">MealSnap</h1>
        <h2 class="font-weight-bold mb-2 text-primary">Sign Up</h2>
        <p class="mb-4 text-grey-darken-1">Create your account to start tracking your meals and goals.</p>
      </div>
      <v-form @submit.prevent="onSubmit" ref="formRef" v-model="formValid">
        <v-text-field v-model="name" label="Name" :rules="[v => !!v || 'Name is required']" required color="primary" class="mb-3" />
        <v-text-field v-model="email" label="Email" :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']" required color="primary" type="email" class="mb-3" />
        <v-text-field v-model="password" label="Password" :rules="[v => !!v || 'Password is required', v => v.length >= 6 || 'Password must be at least 6 characters']" required color="primary" type="password" class="mb-4" />
        <v-btn :disabled="!formValid || loading" color="primary" block size="large" type="submit">
          <v-progress-circular v-if="loading" indeterminate color="white" size="20" class="mr-2" />
          Sign Up
        </v-btn>
        <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
        <v-alert v-if="success" type="success" class="mt-2">Account created! Please check your email to confirm your account.</v-alert>
      </v-form>
      <div class="mt-4 text-center">
        <span class="text-grey-darken-1">Already have an account?</span>
        <v-btn variant="text" color="primary" @click="goToLogin" class="ml-1">Login</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const name = ref('')
const email = ref('')
const password = ref('')
const formValid = ref(false)
const formRef = ref()
const success = ref(false)
const router = useRouter()
const { register, updateProfile, loading, error } = useAuth()

async function onSubmit() {
  if (!formRef.value?.validate()) return
  success.value = false
  const { error: regError } = await register(email.value, password.value)
  if (!regError) {
    await updateProfile({ name: name.value }) // Update profile with name
    success.value = true
    setTimeout(() => {
      success.value = false
      name.value = ''
      email.value = ''
      password.value = ''
      formRef.value?.resetValidation()
      router.push('/home')
    }, 3500)
  }
}
function goToLogin() {
  router.push('/login')
}
</script>