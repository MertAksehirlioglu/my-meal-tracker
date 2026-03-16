<template>
  <div class="circular-progress">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle :cx="size/2" :cy="size/2" :r="radius" fill="none" stroke="#e5e7eb" :stroke-width="strokeWidth"/>
      <circle :cx="size/2" :cy="size/2" :r="radius" fill="none" :stroke="color" :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :transform="`rotate(-90 ${size/2} ${size/2})`"
        style="transition: stroke-dashoffset 0.5s ease"/>
      <text :x="size/2" :y="size/2 + 6" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">{{ Math.round(percentage) }}%</text>
    </svg>
    <div v-if="label" class="label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  max: number
  color?: string
  size?: number
  strokeWidth?: number
  label?: string
}>(), {
  color: '#4ade80',
  size: 120,
  strokeWidth: 12
})

const radius = computed(() => (props.size / 2) - (props.strokeWidth / 2))
const circumference = computed(() => 2 * Math.PI * radius.value)
const percentage = computed(() => props.max > 0 ? Math.min(100, (props.value / props.max) * 100) : 0)
const dashOffset = computed(() => circumference.value * (1 - percentage.value / 100))
</script>

<style scoped>
.circular-progress {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.label {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
