<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="white" elevation="2" fixed>
      <v-container class="d-flex align-center justify-space-between pa-0">
        <div class="d-flex align-center">
          <v-avatar size="40" class="mr-3">
            <v-img src="/logo.png" alt="MealSnap Logo" />
          </v-avatar>
          <h1 class="text-h5 font-weight-bold text-primary">MealSnap</h1>
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
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { onMounted } from 'vue'

const router = useRouter()
const { logout: authLogout, loading, isAuthenticated } = useAuth()

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  }
})

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
