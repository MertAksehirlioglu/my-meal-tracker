<template>
  <v-card class="mb-6" elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h6 font-weight-bold">Last 7 Days</span>
      <v-btn
        size="small"
        variant="text"
        color="primary"
        @click="emit('view-history')"
      >
        View History
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-0">
      <div class="table-scroll-wrapper">
        <table class="nutrition-table">
          <thead>
            <tr>
              <th class="label-col"></th>
              <th
                v-for="day in debouncedWeeklyData"
                :key="day.date"
                class="day-col"
                :class="{
                  'day-selected': day.date === selectedDay,
                  'day-today': day.date === todayIso,
                  'day-hovered': day.date === hoveredDay,
                }"
                @click="emit('select-day', day.date)"
                @mouseenter="hoveredDay = day.date"
                @mouseleave="hoveredDay = null"
              >
                <div class="day-header">
                  <span class="day-name">{{
                    formatShortWeekday(day.date)
                  }}</span>
                  <span class="day-num">{{ formatDayNum(day.date) }}</span>
                  <span v-if="day.date === todayIso" class="today-dot" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.key" class="nutrient-row">
              <td class="label-col">
                <div class="d-flex align-center gap-1">
                  <v-icon :color="row.color" size="14">{{ row.icon }}</v-icon>
                  <span class="nutrient-label">{{ row.label }}</span>
                </div>
              </td>
              <td
                v-for="day in debouncedWeeklyData"
                :key="day.date"
                class="value-col"
                :class="{
                  'day-selected': day.date === selectedDay,
                  'day-today': day.date === todayIso,
                  'day-hovered': day.date === hoveredDay,
                }"
                @click="emit('select-day', day.date)"
                @mouseenter="hoveredDay = day.date"
                @mouseleave="hoveredDay = null"
              >
                <div class="value-wrapper">
                  <span class="nutrient-value">
                    {{
                      getValue(day, row.key) > 0 ? getValue(day, row.key) : '–'
                    }}
                  </span>
                  <span
                    v-if="getValue(day, row.key) > 0"
                    class="nutrient-unit"
                    >{{ row.unit }}</span
                  >
                  <div
                    v-if="getGoal(row.key) && getValue(day, row.key) > 0"
                    class="mini-progress"
                  >
                    <div
                      class="mini-progress-fill"
                      :style="{
                        width: getProgressWidth(day, row.key),
                        background: row.color,
                      }"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-caption text-grey text-center pa-2 mt-0">
        Tap a day to see its meals
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { UserGoal } from '~/server/database/schemas'
import { formatShortWeekday, toDateIso } from '~/lib/date-utils'

interface DailyTotal {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  meal_count: number
}

type NutrientKey =
  | 'total_calories'
  | 'total_protein'
  | 'total_carbs'
  | 'total_fat'

const props = defineProps<{
  weeklyData: DailyTotal[]
  selectedDay: string
  userGoals: UserGoal | null
}>()

const emit = defineEmits<{
  'select-day': [date: string]
  'view-history': []
}>()

const todayIso = computed(() => toDateIso(new Date()))
const hoveredDay = ref<string | null>(null)

// Debounce weeklyData re-renders by 150ms to avoid thrashing on rapid prop
// updates (e.g. multiple API responses arriving in quick succession)
const debouncedWeeklyData = ref<DailyTotal[]>(props.weeklyData)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.weeklyData,
  (newData) => {
    if (debounceTimer !== null) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedWeeklyData.value = newData
      debounceTimer = null
    }, 150)
  },
  { immediate: true }
)

const rows: {
  key: NutrientKey
  label: string
  unit: string
  icon: string
  color: string
  goalKey: keyof UserGoal
}[] = [
  {
    key: 'total_calories',
    label: 'Calories',
    unit: 'kcal',
    icon: 'mdi-fire',
    color: '#ff9800',
    goalKey: 'target_calories',
  },
  {
    key: 'total_protein',
    label: 'Protein',
    unit: 'g',
    icon: 'mdi-arm-flex',
    color: '#1976d2',
    goalKey: 'target_protein',
  },
  {
    key: 'total_carbs',
    label: 'Carbs',
    unit: 'g',
    icon: 'mdi-barley',
    color: '#f9a825',
    goalKey: 'target_carbs',
  },
  {
    key: 'total_fat',
    label: 'Fat',
    unit: 'g',
    icon: 'mdi-water',
    color: '#e53935',
    goalKey: 'target_fat',
  },
]

const getValue = (day: DailyTotal, key: NutrientKey): number =>
  Math.round(day[key] || 0)

const getGoal = (key: NutrientKey): number => {
  const row = rows.find((r) => r.key === key)
  if (!row || !props.userGoals) return 0
  return (props.userGoals[row.goalKey] as number) || 0
}

const getProgressWidth = (day: DailyTotal, key: NutrientKey): string => {
  const goal = getGoal(key)
  if (!goal) return '0%'
  return `${Math.min((getValue(day, key) / goal) * 100, 100)}%`
}

const formatDayNum = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00')
  return d.getDate()
}
</script>

<style scoped>
.table-scroll-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.nutrition-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 360px;
}

.label-col {
  padding: 8px 12px;
  white-space: nowrap;
  min-width: 80px;
  font-size: 12px;
}

.day-col,
.value-col {
  text-align: center;
  padding: 6px 4px;
  cursor: pointer;
  transition: background 0.15s;
  min-width: 52px;
}

.day-hovered {
  background: rgba(var(--v-theme-primary), 0.06);
}

.day-selected {
  background: rgba(var(--v-theme-primary), 0.1) !important;
}

.day-today .day-name {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.day-name {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.day-num {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.today-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  margin-top: 1px;
}

.nutrient-row:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.nutrient-label {
  font-size: 12px;
  font-weight: 500;
}

.value-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.nutrient-value {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}

.nutrient-unit {
  font-size: 9px;
  color: #888;
  line-height: 1;
}

.mini-progress {
  width: 32px;
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s;
}
</style>
