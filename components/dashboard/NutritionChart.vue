<template>
  <v-row>
    <v-col cols="6" sm="3">
      <div class="text-center">
        <CircularProgress
          :value="todayProgress?.total_calories || 0"
          :max="userGoals.target_calories || 2000"
          :color="calorieColor"
          :size="120"
          label="Calories"
        />
        <div class="text-caption mt-2">
          {{ todayProgress?.total_calories || 0 }} /
          {{ userGoals.target_calories || 2000 }}
        </div>
      </div>
    </v-col>

    <v-col cols="6" sm="3">
      <div class="text-center">
        <CircularProgress
          :value="todayProgress?.total_protein || 0"
          :max="userGoals.target_protein || 150"
          :color="proteinColor"
          :size="120"
          label="Protein"
        />
        <div class="text-caption mt-2">
          {{ todayProgress?.total_protein || 0 }}g /
          {{ userGoals.target_protein || 150 }}g
        </div>
      </div>
    </v-col>

    <v-col cols="6" sm="3">
      <div class="text-center">
        <CircularProgress
          :value="todayProgress?.total_carbs || 0"
          :max="userGoals.target_carbs || 250"
          :color="carbColor"
          :size="120"
          label="Carbs"
        />
        <div class="text-caption mt-2">
          {{ todayProgress?.total_carbs || 0 }}g /
          {{ userGoals.target_carbs || 250 }}g
        </div>
      </div>
    </v-col>

    <v-col cols="6" sm="3">
      <div class="text-center">
        <CircularProgress
          :value="todayProgress?.total_fat || 0"
          :max="userGoals.target_fat || 65"
          :color="fatColor"
          :size="120"
          label="Fat"
        />
        <div class="text-caption mt-2">
          {{ todayProgress?.total_fat || 0 }}g /
          {{ userGoals.target_fat || 65 }}g
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserGoal, UserProgress } from '~/server/database/schemas'

const props = defineProps<{
  todayProgress: UserProgress | null
  userGoals: UserGoal
  calorieProgress: number
  proteinProgress: number
  carbProgress: number
  fatProgress: number
}>()

const calorieColor = computed(() => {
  if (props.calorieProgress >= 100) return '#f44336'
  if (props.calorieProgress >= 80) return '#ff9800'
  if (props.calorieProgress >= 60) return '#2196f3'
  return '#9e9e9e'
})

const proteinColor = computed(() => {
  if (props.proteinProgress >= 100) return '#f44336'
  if (props.proteinProgress >= 80) return '#ff9800'
  if (props.proteinProgress >= 60) return '#4caf50'
  return '#9e9e9e'
})

const carbColor = computed(() => {
  if (props.carbProgress >= 100) return '#f44336'
  if (props.carbProgress >= 80) return '#ff9800'
  if (props.carbProgress >= 60) return '#ff9800'
  return '#9e9e9e'
})

const fatColor = computed(() => {
  if (props.fatProgress >= 100) return '#f44336'
  if (props.fatProgress >= 80) return '#ff9800'
  if (props.fatProgress >= 60) return '#00bcd4'
  return '#9e9e9e'
})
</script>
