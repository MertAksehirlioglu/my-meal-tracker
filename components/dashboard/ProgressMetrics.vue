<template>
  <v-card class="mb-6" elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h6 font-weight-bold">Today's Progress</span>
      <v-chip color="primary" size="small">{{ formatDate(today) }}</v-chip>
    </v-card-title>

    <v-card-text>
      <!-- Summary Stats -->
      <v-row class="mb-6">
        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h4 font-weight-bold" :class="calorieColorClass">
              {{ todayProgress?.total_calories || 0 }}
            </div>
            <div class="text-caption text-grey">Calories</div>
            <div class="text-caption" :class="calorieColorClass">
              {{ Math.round(calorieProgress) }}% of goal
            </div>
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h4 font-weight-bold" :class="proteinColorClass">
              {{ todayProgress?.total_protein || 0 }}g
            </div>
            <div class="text-caption text-grey">Protein</div>
            <div class="text-caption" :class="proteinColorClass">
              {{ Math.round(proteinProgress) }}% of goal
            </div>
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h4 font-weight-bold" :class="fatColorClass">
              {{ todayProgress?.total_fat || 0 }}g
            </div>
            <div class="text-caption text-grey">Fat</div>
            <div class="text-caption" :class="fatColorClass">
              {{ Math.round(fatProgress) }}% of goal
            </div>
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h4 font-weight-bold" :class="carbColorClass">
              {{ todayProgress?.total_carbs || 0 }}g
            </div>
            <div class="text-caption text-grey">Carbs</div>
            <div class="text-caption" :class="carbColorClass">
              {{ Math.round(carbProgress) }}% of goal
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Nutrition Charts -->
      <NutritionChart
        v-if="userGoals"
        :today-progress="todayProgress"
        :user-goals="userGoals"
        :calorie-progress="calorieProgress"
        :protein-progress="proteinProgress"
        :carb-progress="carbProgress"
        :fat-progress="fatProgress"
      />

      <!-- Progress Status -->
      <v-row class="mt-4">
        <v-col class="text-center">
          <div class="d-flex align-center justify-center">
            <v-icon :color="overallStatusColor" class="mr-2" size="20">
              {{ overallStatusIcon }}
            </v-icon>
            <span class="text-caption" :class="overallStatusColorClass">
              {{ overallStatusText }}
            </span>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NutritionChart from './NutritionChart.vue'
import type { UserGoal, UserProgress } from '~/server/database/schemas'
import { formatDateLong } from '~/lib/date-utils'

const props = defineProps<{
  todayProgress: UserProgress | null
  userGoals: UserGoal | null
  calorieProgress: number
  proteinProgress: number
  carbProgress: number
  fatProgress: number
  today: Date
}>()

const formatDate = formatDateLong

const calorieColorClass = computed(() => {
  if (props.calorieProgress >= 100) return 'text-error'
  if (props.calorieProgress >= 80) return 'text-warning'
  if (props.calorieProgress >= 60) return 'text-primary'
  return 'text-grey'
})

const proteinColorClass = computed(() => {
  if (props.proteinProgress >= 100) return 'text-error'
  if (props.proteinProgress >= 80) return 'text-warning'
  if (props.proteinProgress >= 60) return 'text-success'
  return 'text-grey'
})

const carbColorClass = computed(() => {
  if (props.carbProgress >= 100) return 'text-error'
  if (props.carbProgress >= 80) return 'text-warning'
  if (props.carbProgress >= 60) return 'text-warning'
  return 'text-grey'
})

const fatColorClass = computed(() => {
  if (props.fatProgress >= 100) return 'text-error'
  if (props.fatProgress >= 80) return 'text-warning'
  if (props.fatProgress >= 60) return 'text-info'
  return 'text-grey'
})

const avgProgress = computed(
  () =>
    (props.calorieProgress +
      props.proteinProgress +
      props.carbProgress +
      props.fatProgress) /
    4
)

const overallStatusColor = computed(() => {
  if (avgProgress.value >= 100) return 'error'
  if (avgProgress.value >= 80) return 'warning'
  if (avgProgress.value >= 60) return 'success'
  return 'grey'
})

const overallStatusColorClass = computed(() => {
  if (avgProgress.value >= 100) return 'text-error'
  if (avgProgress.value >= 80) return 'text-warning'
  if (avgProgress.value >= 60) return 'text-success'
  return 'text-grey'
})

const overallStatusIcon = computed(() => {
  if (avgProgress.value >= 100) return 'mdi-check-circle'
  if (avgProgress.value >= 80) return 'mdi-alert-circle'
  if (avgProgress.value >= 60) return 'mdi-progress-clock'
  return 'mdi-progress-close'
})

const overallStatusText = computed(() => {
  if (avgProgress.value >= 100) return 'Goals exceeded!'
  if (avgProgress.value >= 80) return 'Almost there!'
  if (avgProgress.value >= 60) return 'Good progress'
  return 'Keep going!'
})
</script>
