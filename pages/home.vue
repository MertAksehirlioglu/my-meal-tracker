<template>
  <v-container class="fill-height pa-4" style="max-width: 1200px">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <!-- Today's Progress -->
        <ProgressMetrics
          :today-progress="todayProgress"
          :user-goals="userGoals"
          :calorie-progress="calorieProgress"
          :protein-progress="proteinProgress"
          :carb-progress="carbProgress"
          :fat-progress="fatProgress"
          :today="today"
        />

        <!-- Loading Overlay -->
        <v-overlay v-model="loading" class="d-flex align-center justify-center">
          <v-card class="pa-6 text-center" elevation="8" rounded="lg">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">Loading your dashboard...</h3>
            <p class="text-grey-darken-1">
              Getting your meals and progress data.
            </p>
          </v-card>
        </v-overlay>

        <!-- Weekly Progress Summary -->
        <v-card
          v-if="weeklyData.length > 0"
          class="mb-6"
          elevation="2"
          rounded="lg"
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h6 font-weight-bold">Last 7 Days</span>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              @click="router.push('/history')"
            >
              View History
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="day in weeklyData"
                :key="day.date"
                cols="auto"
                class="text-center pa-1 flex-grow-1"
              >
                <div class="text-caption text-grey mb-1">
                  {{ formatShortDate(day.date) }}
                </div>
                <div
                  class="mx-auto rounded"
                  style="width: 28px; background: #e0e0e0; position: relative"
                  :style="{ height: '60px' }"
                >
                  <div
                    class="rounded"
                    style="
                      width: 100%;
                      position: absolute;
                      bottom: 0;
                      background: #1976d2;
                      transition: height 0.3s;
                    "
                    :style="{ height: getBarHeight(day.total_calories) }"
                  />
                </div>
                <div class="text-caption mt-1" style="font-size: 10px">
                  {{ day.total_calories > 0 ? day.total_calories : '–' }}
                </div>
              </v-col>
            </v-row>
            <div class="text-caption text-grey text-center mt-2">
              Calories per day
            </div>
          </v-card-text>
        </v-card>

        <!-- Today's Meals -->
        <MealList
          :meals="todayMeals"
          :deleting-meal-id="deletingMealId"
          @open-detail="openMealDetail"
          @confirm-delete="confirmDeleteMeal"
          @go-snap="goToSnap"
          @go-history="router.push('/history')"
        />
      </v-col>
    </v-row>

    <!-- Floating Action Button -->
    <v-btn
      color="primary"
      size="x-large"
      icon
      class="floating-action-btn"
      elevation="8"
      @click="goToSnap"
    >
      <v-icon size="32">mdi-camera</v-icon>
    </v-btn>

    <!-- Meal detail modal -->
    <MealDetailModal v-model="detailModalOpen" :meal="selectedMeal" />

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Delete Meal?</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ mealToDelete?.name }}</strong
          >? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="!!deletingMealId"
            @click="deleteMeal"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar feedback -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- Error Notifications -->
    <ErrorNotification
      :error="latestError"
      :retryable="true"
      @close="clearError"
      @retry="retryLoadData"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorHandling } from '~/composables/useErrorHandling'
import ErrorNotification from '~/components/ErrorNotification.vue'
import ProgressMetrics from '~/components/dashboard/ProgressMetrics.vue'
import MealList from '~/components/dashboard/MealList.vue'
import type { Meal, UserGoal, UserProgress } from '~/server/database/schemas'
import { formatShortWeekday } from '~/lib/date-utils'

definePageMeta({
  middleware: 'auth' as never,
  layout: 'authenticated',
})

const router = useRouter()
const { isLoading, latestError, clearError, withErrorHandling, retry } =
  useErrorHandling()

const todayMeals = ref<Meal[]>([])
const userGoals = ref<UserGoal | null>(null)
const todayProgress = ref<UserProgress | null>(null)
const loading = computed(() => isLoading.value)

interface DailyTotal {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  meal_count: number
}
const weeklyData = ref<DailyTotal[]>([])

const deletingMealId = ref<string | null>(null)
const deleteDialog = ref(false)
const mealToDelete = ref<Meal | null>(null)
const detailModalOpen = ref(false)
const selectedMeal = ref<Meal | null>(null)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const today = computed(() => new Date())

const calorieProgress = computed(() => {
  if (!userGoals.value?.target_calories || !todayProgress.value?.total_calories)
    return 0
  return Math.min(
    (todayProgress.value.total_calories / userGoals.value.target_calories) *
      100,
    100
  )
})

const proteinProgress = computed(() => {
  if (!userGoals.value?.target_protein || !todayProgress.value?.total_protein)
    return 0
  return Math.min(
    (todayProgress.value.total_protein / userGoals.value.target_protein) * 100,
    100
  )
})

const carbProgress = computed(() => {
  if (!userGoals.value?.target_carbs || !todayProgress.value?.total_carbs)
    return 0
  return Math.min(
    (todayProgress.value.total_carbs / userGoals.value.target_carbs) * 100,
    100
  )
})

const fatProgress = computed(() => {
  if (!userGoals.value?.target_fat || !todayProgress.value?.total_fat) return 0
  return Math.min(
    (todayProgress.value.total_fat / userGoals.value.target_fat) * 100,
    100
  )
})

const formatShortDate = formatShortWeekday

const getBarHeight = (calories: number) => {
  const maxCal = Math.max(...weeklyData.value.map((d) => d.total_calories), 1)
  const pct = Math.min((calories / maxCal) * 100, 100)
  return `${pct}%`
}

const goToSnap = () => router.push('/snap')

const openMealDetail = (meal: Meal) => {
  selectedMeal.value = meal
  detailModalOpen.value = true
}

const confirmDeleteMeal = (meal: Meal) => {
  mealToDelete.value = meal
  deleteDialog.value = true
}

const deleteMeal = async () => {
  if (!mealToDelete.value) return
  const id = mealToDelete.value.id
  deletingMealId.value = id
  deleteDialog.value = false
  try {
    const { authenticatedFetch } = useAuthenticatedFetch()
    const res = await authenticatedFetch(`/api/meals/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete')
    todayMeals.value = todayMeals.value.filter((m) => m.id !== id)
    snackbarMessage.value = 'Meal deleted'
    snackbarColor.value = 'success'
    snackbar.value = true
    await loadDashboardData()
  } catch {
    snackbarMessage.value = 'Could not delete meal'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    deletingMealId.value = null
    mealToDelete.value = null
  }
}

const loadDashboardData = async () => {
  return withErrorHandling(async () => {
    const user = useSupabaseUser()
    if (!user.value) throw new Error('User not authenticated')

    const { authenticatedFetch } = useAuthenticatedFetch()

    const mealsResponse = await authenticatedFetch('/api/meals/today')
    if (!mealsResponse.ok)
      throw new Error(`Failed to load meals: ${mealsResponse.statusText}`)
    const mealsData = (await mealsResponse.json()) as { data?: Meal[] }
    todayMeals.value = mealsData?.data || []

    const goalsResponse = await authenticatedFetch('/api/goals/active')
    if (!goalsResponse.ok)
      throw new Error(`Failed to load goals: ${goalsResponse.statusText}`)
    const goalsData = (await goalsResponse.json()) as { data?: UserGoal }
    userGoals.value = goalsData?.data || null

    const progressResponse = await authenticatedFetch('/api/progress/today')
    if (!progressResponse.ok)
      throw new Error(`Failed to load progress: ${progressResponse.statusText}`)
    const progressData = (await progressResponse.json()) as {
      data?: UserProgress
    }
    todayProgress.value = progressData?.data || null

    try {
      const weeklyResponse = await authenticatedFetch('/api/progress/weekly')
      if (weeklyResponse.ok) {
        const weeklyJson = (await weeklyResponse.json()) as {
          data?: DailyTotal[]
        }
        weeklyData.value = weeklyJson?.data || []
      }
    } catch {
      // Weekly data is non-critical; ignore errors
    }
  }, 'loading dashboard data')
}

const retryLoadData = async () => {
  await retry(loadDashboardData, 3, 1000, 'dashboard data')
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.floating-action-btn {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 1000 !important;
  transition: all 0.3s ease !important;
}

.floating-action-btn:hover {
  transform: scale(1.1) !important;
}

@media (max-width: 768px) {
  .floating-action-btn {
    bottom: 16px !important;
    right: 16px !important;
  }
}

@media (max-width: 480px) {
  .floating-action-btn {
    bottom: 12px !important;
    right: 12px !important;
  }
}
</style>
