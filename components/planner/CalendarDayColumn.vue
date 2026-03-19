<template>
  <div class="day-column" :class="{ 'day-column--today': isToday }">
    <!-- Day header -->
    <div class="day-header text-center mb-2">
      <div
        class="text-caption font-weight-bold text-uppercase"
        :class="isToday ? 'text-primary' : 'text-medium-emphasis'"
      >
        {{ dayLabel }}
      </div>
    </div>

    <!-- Meal type slots -->
    <CalendarSlot
      v-for="mealType in MEAL_TYPES"
      :key="mealType"
      :date="date"
      :meal-type="mealType"
      :slots="slotsForType(mealType)"
      class="mb-2"
      @drop="(invId, d, mt) => $emit('drop', invId, d, mt)"
      @confirm="(id, confirmed) => $emit('confirm', id, confirmed)"
      @remove="(id) => $emit('remove', id)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MealPlanSlot } from '~/server/database/schemas'
import { shortDayLabel } from '~/lib/week-utils'
import CalendarSlot from './CalendarSlot.vue'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

const props = defineProps<{
  date: string
  slots: MealPlanSlot[]
}>()

defineEmits<{
  drop: [inventoryId: string, date: string, mealType: string]
  confirm: [slotId: string, confirmed: boolean]
  remove: [slotId: string]
}>()

const dayLabel = computed(() => shortDayLabel(props.date))

const isToday = computed(() => {
  const today = new Date()
  const d = new Date(props.date + 'T00:00:00')
  return (
    today.getFullYear() === d.getFullYear() &&
    today.getMonth() === d.getMonth() &&
    today.getDate() === d.getDate()
  )
})

function slotsForType(mealType: string): MealPlanSlot[] {
  return props.slots.filter((s) => s.meal_type === mealType)
}
</script>

<style scoped>
.day-column {
  min-width: 130px;
  flex: 1;
}
.day-header {
  padding: 4px 0;
  border-bottom: 2px solid transparent;
}
.day-column--today .day-header {
  border-bottom-color: #1a2e1c;
}
</style>
