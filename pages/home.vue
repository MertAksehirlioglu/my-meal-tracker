<template>
  <v-container class="fill-height pa-4" style="max-width: 1200px">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <!-- Today's Progress Card -->
        <v-card class="mb-6" elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h6 font-weight-bold">Today's Progress</span>
            <v-chip color="primary" size="small">{{
              formatDate(today)
            }}</v-chip>
          </v-card-title>

          <v-card-text>
            <!-- Summary Stats -->
            <v-row class="mb-6">
              <v-col cols="6" sm="3">
                <div class="text-center">
                  <div
                    class="text-h4 font-weight-bold"
                    :class="getCalorieColorClass()"
                  >
                    {{ todayProgress?.total_calories || 0 }}
                  </div>
                  <div class="text-caption text-grey">Calories</div>
                  <div class="text-caption" :class="getCalorieColorClass()">
                    {{ Math.round(calorieProgress) }}% of goal
                  </div>
                </div>
              </v-col>

              <v-col cols="6" sm="3">
                <div class="text-center">
                  <div
                    class="text-h4 font-weight-bold"
                    :class="getProteinColorClass()"
                  >
                    {{ todayProgress?.total_protein || 0 }}g
                  </div>
                  <div class="text-caption text-grey">Protein</div>
                  <div class="text-caption" :class="getProteinColorClass()">
                    {{ Math.round(proteinProgress) }}% of goal
                  </div>
                </div>
              </v-col>

              <v-col cols="6" sm="3">
                <div class="text-center">
                  <div
                    class="text-h4 font-weight-bold"
                    :class="getFatColorClass()"
                  >
                    {{ todayProgress?.total_fat || 0 }}g
                  </div>
                  <div class="text-caption text-grey">Fat</div>
                  <div class="text-caption" :class="getFatColorClass()">
                    {{ Math.round(fatProgress) }}% of goal
                  </div>
                </div>
              </v-col>

              <v-col cols="6" sm="3">
                <div class="text-center">
                  <div
                    class="text-h4 font-weight-bold"
                    :class="getCarbColorClass()"
                  >
                    {{ todayProgress?.total_carbs || 0 }}g
                  </div>
                  <div class="text-caption text-grey">Carbs</div>
                  <div class="text-caption" :class="getCarbColorClass()">
                    {{ Math.round(carbProgress) }}% of goal
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Progress Charts -->
            <div v-if="userGoals">
              <v-row>
                <v-col cols="6" sm="3">
                  <div class="text-center">
                    <div class="text-caption mb-2">Calories</div>
                    <div class="position-relative d-inline-block">
                      <canvas ref="calorieChart" width="120" height="120" />
                      <div
                        class="position-absolute"
                        style="
                          top: 50%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                        "
                      >
                        <div
                          class="text-body-1 font-weight-bold"
                          :class="getCalorieColorClass()"
                        >
                          {{ Math.round(calorieProgress) }}%
                        </div>
                      </div>
                    </div>
                    <div class="text-caption mt-2">
                      {{ todayProgress?.total_calories || 0 }} /
                      {{ userGoals.target_calories || 2000 }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="6" sm="3">
                  <div class="text-center">
                    <div class="text-caption mb-2">Protein</div>
                    <div class="position-relative d-inline-block">
                      <canvas ref="proteinChart" width="120" height="120" />
                      <div
                        class="position-absolute"
                        style="
                          top: 50%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                        "
                      >
                        <div
                          class="text-body-1 font-weight-bold"
                          :class="getProteinColorClass()"
                        >
                          {{ Math.round(proteinProgress) }}%
                        </div>
                      </div>
                    </div>
                    <div class="text-caption mt-2">
                      {{ todayProgress?.total_protein || 0 }}g /
                      {{ userGoals.target_protein || 150 }}g
                    </div>
                  </div>
                </v-col>

                <v-col cols="6" sm="3">
                  <div class="text-center">
                    <div class="text-caption mb-2">Carbs</div>
                    <div class="position-relative d-inline-block">
                      <canvas ref="carbChart" width="120" height="120" />
                      <div
                        class="position-absolute"
                        style="
                          top: 50%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                        "
                      >
                        <div
                          class="text-body-1 font-weight-bold"
                          :class="getCarbColorClass()"
                        >
                          {{ Math.round(carbProgress) }}%
                        </div>
                      </div>
                    </div>
                    <div class="text-caption mt-2">
                      {{ todayProgress?.total_carbs || 0 }}g /
                      {{ userGoals.target_carbs || 250 }}g
                    </div>
                  </div>
                </v-col>

                <v-col cols="6" sm="3">
                  <div class="text-center">
                    <div class="text-caption mb-2">Fat</div>
                    <div class="position-relative d-inline-block">
                      <canvas ref="fatChart" width="120" height="120" />
                      <div
                        class="position-absolute"
                        style="
                          top: 50%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                        "
                      >
                        <div
                          class="text-body-1 font-weight-bold"
                          :class="getFatColorClass()"
                        >
                          {{ Math.round(fatProgress) }}%
                        </div>
                      </div>
                    </div>
                    <div class="text-caption mt-2">
                      {{ todayProgress?.total_fat || 0 }}g /
                      {{ userGoals.target_fat || 65 }}g
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- Progress Status -->
            <v-row class="mt-4">
              <v-col class="text-center">
                <div class="d-flex align-center justify-center">
                  <v-icon
                    :color="getOverallStatusColor()"
                    class="mr-2"
                    size="20"
                  >
                    {{ getOverallStatusIcon() }}
                  </v-icon>
                  <span
                    class="text-caption"
                    :class="getOverallStatusColorClass()"
                  >
                    {{ getOverallStatusText() }}
                  </span>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

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

        <!-- Today's Meals -->
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h6 font-weight-bold">Today's Meals</span>
            <v-chip v-if="todayMeals.length > 0" color="primary" size="small">
              {{ todayMeals.length }} meals
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div v-if="todayMeals.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-food</v-icon
              >
              <p class="text-grey">No meals logged today</p>
              <div class="d-flex flex-column gap-2 align-center mt-4 ">
                <v-btn 
                  color="primary" 
                  size="large"
                  class="px-8 py-2"
                  @click="goToSnap"
                  >Add Your First Meal</v-btn
                >
              </div>
            </div>

            <div v-else>
              <v-list>
                <v-list-item
                  v-for="meal in todayMeals"
                  :key="meal.id"
                  class="mb-2"
                  style="background-color: #f5f5f5; border-radius: 8px"
                >
                  <template #prepend>
                    <v-icon :color="getMealTypeColor(meal.meal_type)" size="24">
                      {{ getMealTypeIcon(meal.meal_type) }}
                    </v-icon>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ meal.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption text-grey">
                    {{ formatTime(meal.consumed_at) }}
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="text-right">
                      <div class="font-weight-medium">
                        {{ meal.total_calories }} cal
                      </div>
                      <div class="text-caption text-grey">
                        {{ meal.total_protein }}g protein
                      </div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorHandling } from '~/composables/useErrorHandling'
import ErrorNotification from '~/components/ErrorNotification.vue'
import type { Meal, UserGoal, UserProgress } from '~/server/database/schemas'

// Page meta
definePageMeta({
  middleware: 'auth' as never,
  layout: 'authenticated',
})

const router = useRouter()
const { isLoading, latestError, clearError, withErrorHandling, retry } =
  useErrorHandling()

// Reactive data
const todayMeals = ref<Meal[]>([])
const userGoals = ref<UserGoal | null>(null)
const todayProgress = ref<UserProgress | null>(null)
const loading = computed(() => isLoading.value)

// Chart refs
const calorieChart = ref<HTMLCanvasElement>()
const proteinChart = ref<HTMLCanvasElement>()
const carbChart = ref<HTMLCanvasElement>()
const fatChart = ref<HTMLCanvasElement>()

// Computed
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

// Methods
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const getMealTypeColor = (mealType: string) => {
  const colors = {
    breakfast: 'orange',
    lunch: 'green',
    dinner: 'purple',
    snack: 'blue',
  }
  return colors[mealType as keyof typeof colors] || 'grey'
}

const getMealTypeIcon = (mealType: string) => {
  const icons = {
    breakfast: 'mdi-sunrise',
    lunch: 'mdi-sunny',
    dinner: 'mdi-moon-waning-crescent',
    snack: 'mdi-food-apple',
  }
  return icons[mealType as keyof typeof icons] || 'mdi-food'
}

// Color class methods for progress indicators
const getCalorieColorClass = () => {
  const progress = calorieProgress.value
  if (progress >= 100) return 'text-error'
  if (progress >= 80) return 'text-warning'
  if (progress >= 60) return 'text-primary'
  return 'text-grey'
}

const getProteinColorClass = () => {
  const progress = proteinProgress.value
  if (progress >= 100) return 'text-error'
  if (progress >= 80) return 'text-warning'
  if (progress >= 60) return 'text-success'
  return 'text-grey'
}

const getCarbColorClass = () => {
  const progress = carbProgress.value
  if (progress >= 100) return 'text-error'
  if (progress >= 80) return 'text-warning'
  if (progress >= 60) return 'text-warning'
  return 'text-grey'
}

const getFatColorClass = () => {
  const progress = fatProgress.value
  if (progress >= 100) return 'text-error'
  if (progress >= 80) return 'text-warning'
  if (progress >= 60) return 'text-info'
  return 'text-grey'
}

// Overall status methods
const getOverallStatusColor = () => {
  const avgProgress =
    (calorieProgress.value +
      proteinProgress.value +
      carbProgress.value +
      fatProgress.value) /
    4
  if (avgProgress >= 100) return 'error'
  if (avgProgress >= 80) return 'warning'
  if (avgProgress >= 60) return 'success'
  return 'grey'
}

const getOverallStatusColorClass = () => {
  const avgProgress =
    (calorieProgress.value +
      proteinProgress.value +
      carbProgress.value +
      fatProgress.value) /
    4
  if (avgProgress >= 100) return 'text-error'
  if (avgProgress >= 80) return 'text-warning'
  if (avgProgress >= 60) return 'text-success'
  return 'text-grey'
}

const getOverallStatusIcon = () => {
  const avgProgress =
    (calorieProgress.value +
      proteinProgress.value +
      carbProgress.value +
      fatProgress.value) /
    4
  if (avgProgress >= 100) return 'mdi-check-circle'
  if (avgProgress >= 80) return 'mdi-alert-circle'
  if (avgProgress >= 60) return 'mdi-progress-clock'
  return 'mdi-progress-close'
}

const getOverallStatusText = () => {
  const avgProgress =
    (calorieProgress.value +
      proteinProgress.value +
      carbProgress.value +
      fatProgress.value) /
    4
  if (avgProgress >= 100) return 'Goals exceeded!'
  if (avgProgress >= 80) return 'Almost there!'
  if (avgProgress >= 60) return 'Good progress'
  return 'Keep going!'
}

// Chart drawing methods
const drawPieChart = (
  canvas: HTMLCanvasElement,
  percentage: number,
  color: string
) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 10

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw background circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  ctx.fillStyle = '#f0f0f0'
  ctx.fill()

  // Draw progress arc
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + (percentage / 100) * 2 * Math.PI

  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, startAngle, endAngle)
  ctx.lineTo(centerX, centerY)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

const updateCharts = () => {
  if (calorieChart.value) {
    const color =
      calorieProgress.value >= 100
        ? '#f44336'
        : calorieProgress.value >= 80
          ? '#ff9800'
          : calorieProgress.value >= 60
            ? '#2196f3'
            : '#9e9e9e'
    drawPieChart(calorieChart.value, calorieProgress.value, color)
  }

  if (proteinChart.value) {
    const color =
      proteinProgress.value >= 100
        ? '#f44336'
        : proteinProgress.value >= 80
          ? '#ff9800'
          : proteinProgress.value >= 60
            ? '#4caf50'
            : '#9e9e9e'
    drawPieChart(proteinChart.value, proteinProgress.value, color)
  }

  if (carbChart.value) {
    const color =
      carbProgress.value >= 100
        ? '#f44336'
        : carbProgress.value >= 80
          ? '#ff9800'
          : carbProgress.value >= 60
            ? '#ff9800'
            : '#9e9e9e'
    drawPieChart(carbChart.value, carbProgress.value, color)
  }

  if (fatChart.value) {
    const color =
      fatProgress.value >= 100
        ? '#f44336'
        : fatProgress.value >= 80
          ? '#ff9800'
          : fatProgress.value >= 60
            ? '#00bcd4'
            : '#9e9e9e'
    drawPieChart(fatChart.value, fatProgress.value, color)
  }
}

const goToSnap = () => {
  router.push('/snap')
}

// Load data
const loadDashboardData = async () => {
  const result = await withErrorHandling(async () => {
    const user = useSupabaseUser()
    
    // Ensure user is authenticated
    if (!user.value) {
      throw new Error('User not authenticated')
    }
    
    const { authenticatedFetch } = useAuthenticatedFetch()

    // Load today's meals
    const mealsResponse = await authenticatedFetch('/api/meals/today')
    if (!mealsResponse.ok) {
      throw new Error(`Failed to load meals: ${mealsResponse.statusText}`)
    }
    const mealsData = (await mealsResponse.json()) as { data?: Meal[] }
    todayMeals.value = mealsData?.data || []

    // Load user goals
    const goalsResponse = await authenticatedFetch('/api/goals/active')
    if (!goalsResponse.ok) {
      throw new Error(`Failed to load goals: ${goalsResponse.statusText}`)
    }
    const goalsData = (await goalsResponse.json()) as { data?: UserGoal }
    userGoals.value = goalsData?.data || null

    // Load today's progress
    const progressResponse = await authenticatedFetch('/api/progress/today')
    if (!progressResponse.ok) {
      throw new Error(`Failed to load progress: ${progressResponse.statusText}`)
    }
    const progressData = (await progressResponse.json()) as {
      data?: UserProgress
    }
    todayProgress.value = progressData?.data || null

    // Update charts after data is loaded
    nextTick(() => {
      updateCharts()
    })
  }, 'loading dashboard data')

  return result
}

const retryLoadData = async () => {
  await retry(loadDashboardData, 3, 1000, 'dashboard data')
}

// Watch for progress changes to update charts
watch([calorieProgress, proteinProgress, carbProgress, fatProgress], () => {
  nextTick(() => {
    updateCharts()
  })
})

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
