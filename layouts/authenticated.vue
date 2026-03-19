<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="surface" elevation="2" fixed>
      <v-container class="d-flex align-center justify-space-between pa-0">
        <div class="d-flex align-center">
          <v-avatar size="40" class="mr-3">
            <v-img src="/logo.png" alt="MealSnap Logo" />
          </v-avatar>
          <h1 class="text-h5 font-weight-bold text-primary">MealSnap</h1>
          <!-- Demo Mode Indicator -->
          <v-chip
            v-if="isDemoUser"
            color="primary"
            variant="outlined"
            size="small"
            class="ml-3"
            prepend-icon="mdi-test-tube"
          >
            Demo Mode
          </v-chip>
        </div>

        <div class="d-flex align-center">
          <!-- Home Button -->
          <v-btn
            icon
            :color="$route.path === '/home' ? 'primary' : 'grey'"
            class="mr-2"
            @click="goToHome"
          >
            <v-icon>mdi-home</v-icon>
          </v-btn>

          <!-- History Button -->
          <v-btn
            icon
            :color="$route.path === '/history' ? 'primary' : 'grey'"
            class="mr-2"
            @click="router.push('/history')"
          >
            <v-icon>mdi-history</v-icon>
          </v-btn>

          <!-- Dark Mode Toggle -->
          <v-btn icon class="mr-2" @click="toggleDarkMode">
            <v-icon>{{
              isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'
            }}</v-icon>
          </v-btn>

          <!-- Profile Menu -->
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon
                v-bind="props"
                :color="$route.path === '/profile' ? 'primary' : 'grey'"
              >
                <v-icon>mdi-account-circle</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="goToProfile">
                <v-list-item-title>Profile</v-list-item-title>
              </v-list-item>
              <v-list-item @click="goToGoals">
                <v-list-item-title>Goals</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="logout">
                <v-list-item-title class="text-error">
                  <v-progress-circular
                    v-if="loading"
                    indeterminate
                    color="error"
                    size="20"
                    class="mr-2"
                  />
                  Logout
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Main Content -->
    <v-main style="padding-top: 80px">
      <slot />
    </v-main>

    <!-- Demo Notifications -->
    <DemoNotification />
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuth } from '~/composables/useAuth'
import DemoNotification from '~/components/DemoNotification.vue'

const router = useRouter()
const theme = useTheme()
const { logout: authLogout, loading, isAuthenticated, isDemoUser } = useAuth()

const isDark = ref(false)

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  }
  const saved = localStorage.getItem('mealsnap-theme')
  if (saved === 'dark') {
    isDark.value = true
    theme.global.name.value = 'dark'
  }
})

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
  localStorage.setItem('mealsnap-theme', isDark.value ? 'dark' : 'light')
}

const goToHome = () => {
  router.push('/home')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToGoals = () => {
  router.push('/goals')
}

const logout = async () => {
  await authLogout()
  router.push('/login')
}
</script>
