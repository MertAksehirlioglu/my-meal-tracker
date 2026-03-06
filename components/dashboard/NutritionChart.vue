<template>
  <v-row>
    <v-col cols="6" sm="3">
      <div class="text-center">
        <div class="text-caption mb-2">Calories</div>
        <div class="position-relative d-inline-block">
          <canvas ref="calorieCanvas" width="120" height="120" />
          <div
            class="position-absolute"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
          >
            <div
              class="text-body-1 font-weight-bold"
              :class="calorieColorClass"
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
          <canvas ref="proteinCanvas" width="120" height="120" />
          <div
            class="position-absolute"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
          >
            <div
              class="text-body-1 font-weight-bold"
              :class="proteinColorClass"
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
          <canvas ref="carbCanvas" width="120" height="120" />
          <div
            class="position-absolute"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
          >
            <div class="text-body-1 font-weight-bold" :class="carbColorClass">
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
          <canvas ref="fatCanvas" width="120" height="120" />
          <div
            class="position-absolute"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
          >
            <div class="text-body-1 font-weight-bold" :class="fatColorClass">
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
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { UserGoal, UserProgress } from '~/server/database/schemas'

const props = defineProps<{
  todayProgress: UserProgress | null
  userGoals: UserGoal
  calorieProgress: number
  proteinProgress: number
  carbProgress: number
  fatProgress: number
}>()

const calorieCanvas = ref<HTMLCanvasElement>()
const proteinCanvas = ref<HTMLCanvasElement>()
const carbCanvas = ref<HTMLCanvasElement>()
const fatCanvas = ref<HTMLCanvasElement>()

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

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  ctx.fillStyle = '#f0f0f0'
  ctx.fill()

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
  if (calorieCanvas.value) {
    const color =
      props.calorieProgress >= 100
        ? '#f44336'
        : props.calorieProgress >= 80
          ? '#ff9800'
          : props.calorieProgress >= 60
            ? '#2196f3'
            : '#9e9e9e'
    drawPieChart(calorieCanvas.value, props.calorieProgress, color)
  }

  if (proteinCanvas.value) {
    const color =
      props.proteinProgress >= 100
        ? '#f44336'
        : props.proteinProgress >= 80
          ? '#ff9800'
          : props.proteinProgress >= 60
            ? '#4caf50'
            : '#9e9e9e'
    drawPieChart(proteinCanvas.value, props.proteinProgress, color)
  }

  if (carbCanvas.value) {
    const color =
      props.carbProgress >= 100
        ? '#f44336'
        : props.carbProgress >= 80
          ? '#ff9800'
          : props.carbProgress >= 60
            ? '#ff9800'
            : '#9e9e9e'
    drawPieChart(carbCanvas.value, props.carbProgress, color)
  }

  if (fatCanvas.value) {
    const color =
      props.fatProgress >= 100
        ? '#f44336'
        : props.fatProgress >= 80
          ? '#ff9800'
          : props.fatProgress >= 60
            ? '#00bcd4'
            : '#9e9e9e'
    drawPieChart(fatCanvas.value, props.fatProgress, color)
  }
}

watch(
  () => [
    props.calorieProgress,
    props.proteinProgress,
    props.carbProgress,
    props.fatProgress,
  ],
  () => {
    nextTick(() => updateCharts())
  }
)

onMounted(() => {
  nextTick(() => updateCharts())
})
</script>
