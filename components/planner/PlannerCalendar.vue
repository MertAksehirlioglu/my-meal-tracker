<template>
  <div class="planner-calendar">
    <div class="calendar-grid">
      <CalendarDayColumn
        v-for="day in days"
        :key="day"
        :date="day"
        :slots="slotsForDay(day)"
        @drop="(invId, d, mt) => $emit('drop', invId, d, mt)"
        @confirm="(id, confirmed) => $emit('confirm', id, confirmed)"
        @remove="(id) => $emit('remove', id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MealPlanSlot } from '~/server/database/schemas'
import { weekDays } from '~/lib/week-utils'
import CalendarDayColumn from './CalendarDayColumn.vue'

const props = defineProps<{
  weekStart: string
  slots: MealPlanSlot[]
}>()

defineEmits<{
  drop: [inventoryId: string, date: string, mealType: string]
  confirm: [slotId: string, confirmed: boolean]
  remove: [slotId: string]
}>()

const days = computed(() => weekDays(props.weekStart))

function slotsForDay(date: string): MealPlanSlot[] {
  return props.slots.filter((s) => s.planned_date === date)
}
</script>

<style scoped>
.planner-calendar {
  overflow-x: auto;
}
.calendar-grid {
  display: flex;
  gap: 8px;
  min-width: 700px;
}
</style>
