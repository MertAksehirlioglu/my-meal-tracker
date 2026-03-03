<template>
  <v-container class="fill-height pa-4" style="max-width: 900px">
    <v-row justify="center">
      <v-col cols="12">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="d-flex align-center justify-space-between flex-wrap gap-2">
            <span class="text-h6 font-weight-bold">Meal History</span>
            <div class="d-flex align-center gap-2">
              <v-btn
                icon
                size="small"
                :disabled="loadingMeals"
                @click="previousDay"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-menu v-model="datePicker" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-chip v-bind="props" color="primary" size="small" style="cursor: pointer">
                    {{ formatDisplayDate(selectedDate) }}
                  </v-chip>
                </template>
                <v-date-picker
                  v-model="pickerValue"
                  :max="todayIso"
                  color="primary"
                  @update:model-value="onDatePicked"
                />
              </v-menu>
              <v-btn
                icon
                size="small"
                :disabled="isToday || loadingMeals"
                @click="nextDay"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
              <v-btn
                v-if="meals.length > 0"
                size="small"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-download"
                @click="exportCsv"
              >
                Export CSV
              </v-btn>
            </div>
          </v-card-title>

          <!-- Daily Totals Summary -->
          <v-card-text v-if="meals.length > 0">
            <v-row class="mb-2">
              <v-col v-for="macro in macroSummary" :key="macro.label" cols="6" sm="3">
                <div class="text-center pa-2 rounded" style="background:#f5f5f5">
                  <div class="text-h6 font-weight-bold" :class="macro.colorClass">
                    {{ macro.value }}
                  </div>
                  <div class="text-caption text-grey">{{ macro.label }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Meal List -->
        <v-card elevation="2" rounded="lg">
          <v-card-text>
            <div v-if="loadingMeals" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
              <p class="text-grey">Loading meals…</p>
            </div>

            <div v-else-if="meals.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-food-off</v-icon>
              <p class="text-grey">No meals logged on this day</p>
              <v-btn class="mt-4" color="primary" @click="router.push('/add-meal')">
                Log a Meal
              </v-btn>
            </div>

            <v-list v-else>
              <v-list-item
                v-for="meal in meals"
                :key="meal.id"
                class="mb-2"
                style="background-color:#f5f5f5; border-radius:8px"
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
                  {{ formatTime(meal.consumed_at) }} · {{ meal.meal_type }}
                </v-list-item-subtitle>

                <template #append>
                  <div class="text-right d-flex align-center gap-2">
                    <div>
                      <div class="font-weight-medium">{{ meal.total_calories }} cal</div>
                      <div class="text-caption text-grey">
                        P {{ meal.total_protein }}g · C {{ meal.total_carbs }}g · F {{ meal.total_fat }}g
                      </div>
                    </div>
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      variant="text"
                      :loading="deletingId === meal.id"
                      @click="confirmDelete(meal)"
                    >
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Delete Meal?</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ mealToDelete?.name }}</strong>? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="!!deletingId" @click="deleteMeal">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for feedback -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Meal } from '~/server/database/schemas'

definePageMeta({
  middleware: 'auth' as never,
  layout: 'authenticated',
})

const router = useRouter()
const { authenticatedFetch } = useAuthenticatedFetch()

const today = new Date()
const todayIso = today.toISOString().split('T')[0]

const selectedDate = ref<string>(todayIso)
const pickerValue = ref<string>(todayIso)
const datePicker = ref(false)
const meals = ref<Meal[]>([])
const loadingMeals = ref(false)
const deletingId = ref<string | null>(null)
const deleteDialog = ref(false)
const mealToDelete = ref<Meal | null>(null)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const isToday = computed(() => selectedDate.value === todayIso)

const macroSummary = computed(() => {
  const totals = meals.value.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.total_calories ?? 0),
      protein: acc.protein + (m.total_protein ?? 0),
      carbs: acc.carbs + (m.total_carbs ?? 0),
      fat: acc.fat + (m.total_fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
  return [
    { label: 'Calories', value: totals.calories, colorClass: 'text-primary' },
    { label: 'Protein', value: `${Math.round(totals.protein)}g`, colorClass: 'text-success' },
    { label: 'Carbs', value: `${Math.round(totals.carbs)}g`, colorClass: 'text-warning' },
    { label: 'Fat', value: `${Math.round(totals.fat)}g`, colorClass: 'text-info' },
  ]
})

const formatDisplayDate = (dateStr: string) => {
  const MIDDAY_TIME_OFFSET = 'T12:00:00'
  const d = new Date(dateStr + MIDDAY_TIME_OFFSET)
  if (dateStr === todayIso) return 'Today'
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const getMealTypeColor = (mealType: string) => {
  const colors: Record<string, string> = { breakfast: 'orange', lunch: 'green', dinner: 'purple', snack: 'blue' }
  return colors[mealType] ?? 'grey'
}

const getMealTypeIcon = (mealType: string) => {
  const icons: Record<string, string> = {
    breakfast: 'mdi-sunrise',
    lunch: 'mdi-sunny',
    dinner: 'mdi-moon-waning-crescent',
    snack: 'mdi-food-apple',
  }
  return icons[mealType] ?? 'mdi-food'
}

const loadMeals = async () => {
  loadingMeals.value = true
  try {
    const res = await authenticatedFetch(`/api/meals/history?date=${selectedDate.value}`)
    if (!res.ok) throw new Error('Failed to load meals')
    const json = (await res.json()) as { data?: Meal[] }
    meals.value = json.data ?? []
  } catch {
    meals.value = []
  } finally {
    loadingMeals.value = false
  }
}

const MIDDAY_TIME_OFFSET = 'T12:00:00'

const previousDay = () => {
  const d = new Date(selectedDate.value + MIDDAY_TIME_OFFSET)
  d.setDate(d.getDate() - 1)
  selectedDate.value = d.toISOString().split('T')[0]
}

const nextDay = () => {
  const d = new Date(selectedDate.value + MIDDAY_TIME_OFFSET)
  d.setDate(d.getDate() + 1)
  const next = d.toISOString().split('T')[0]
  if (next <= todayIso) selectedDate.value = next
}

const onDatePicked = (value: unknown) => {
  const raw = value as string | Date | null | undefined
  if (!raw) return
  const iso = typeof raw === 'string' ? raw : (raw as Date).toISOString().split('T')[0]
  selectedDate.value = iso
  datePicker.value = false
}

const confirmDelete = (meal: Meal) => {
  mealToDelete.value = meal
  deleteDialog.value = true
}

const deleteMeal = async () => {
  if (!mealToDelete.value) return
  deletingId.value = mealToDelete.value.id
  deleteDialog.value = false
  try {
    const res = await authenticatedFetch(`/api/meals/${mealToDelete.value.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    meals.value = meals.value.filter((m) => m.id !== mealToDelete.value?.id)
    snackbarMessage.value = 'Meal deleted'
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch {
    snackbarMessage.value = 'Could not delete meal'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    deletingId.value = null
    mealToDelete.value = null
  }
}

const exportCsv = () => {
  const headers = ['Date', 'Time', 'Name', 'Type', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)', 'Sugar (g)', 'Notes']
  const rows = meals.value.map((m) => [
    selectedDate.value,
    formatTime(m.consumed_at),
    `"${(m.name ?? '').replace(/"/g, '""')}"`,
    m.meal_type,
    m.total_calories,
    m.total_protein,
    m.total_carbs,
    m.total_fat,
    m.total_fiber ?? '',
    m.total_sugar ?? '',
    `"${(m.notes ?? '').replace(/"/g, '""')}"`,
  ])
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `meals-${selectedDate.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

watch(selectedDate, () => {
  pickerValue.value = selectedDate.value
  loadMeals()
})

onMounted(loadMeals)
</script>
