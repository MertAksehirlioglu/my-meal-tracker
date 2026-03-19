<template>
  <v-container class="fill-height pa-4" style="max-width: 900px">
    <v-row justify="center">
      <v-col cols="12">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title
            class="d-flex align-center justify-space-between flex-wrap gap-2"
          >
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
                  <v-chip
                    v-bind="props"
                    color="primary"
                    size="small"
                    style="cursor: pointer"
                  >
                    {{ formatDateForDisplay(selectedDate) }}
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
              <v-col
                v-for="macro in macroSummary"
                :key="macro.label"
                cols="6"
                sm="3"
              >
                <div class="text-center pa-2 rounded bg-surface-variant">
                  <div
                    class="text-h6 font-weight-bold"
                    :class="macro.colorClass"
                  >
                    {{ macro.value }}
                  </div>
                  <div class="text-caption text-grey">{{ macro.label }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Meal List / Photo Grid -->
        <v-card elevation="2" rounded="lg">
          <!-- View toggle -->
          <v-card-title
            v-if="meals.length > 0 && !loadingMeals"
            class="d-flex justify-end pa-2 pb-0"
          >
            <v-btn-toggle
              v-model="viewMode"
              mandatory
              density="compact"
              color="primary"
            >
              <v-btn value="list" icon size="small">
                <v-icon size="18">mdi-format-list-bulleted</v-icon>
              </v-btn>
              <v-btn value="grid" icon size="small">
                <v-icon size="18">mdi-grid</v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-card-title>

          <v-card-text>
            <div v-if="loadingMeals" class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="48"
                class="mb-4"
              />
              <p class="text-grey">Loading meals…</p>
            </div>

            <div v-else-if="meals.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-food-off</v-icon
              >
              <p class="text-grey">No meals logged on this day</p>
              <v-btn
                class="mt-4"
                color="primary"
                @click="router.push('/add-meal')"
              >
                Log a Meal
              </v-btn>
            </div>

            <!-- Photo grid view -->
            <div v-else-if="viewMode === 'grid'" class="meal-photo-grid">
              <div
                v-for="meal in meals"
                :key="meal.id"
                class="meal-photo-card"
                @click="openMealDetail(meal)"
              >
                <div class="meal-photo-thumb">
                  <v-img
                    v-if="meal.image_url"
                    :src="meal.image_url"
                    :alt="meal.name"
                    cover
                    class="fill-height"
                  />
                  <div v-else class="meal-photo-placeholder">
                    <span class="meal-placeholder-emoji">🍽️</span>
                  </div>
                </div>
                <div class="meal-photo-info pa-2">
                  <div class="text-caption font-weight-medium text-truncate">
                    {{ meal.name }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ meal.total_calories }} cal
                  </div>
                  <v-btn
                    icon
                    size="x-small"
                    color="primary"
                    variant="text"
                    class="meal-photo-edit"
                    @click.stop="openEditModal(meal)"
                  >
                    <v-icon size="14">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="x-small"
                    color="error"
                    variant="text"
                    class="meal-photo-delete"
                    :loading="deletingId === meal.id"
                    @click.stop="confirmDelete(meal)"
                  >
                    <v-icon size="14">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- List view -->
            <v-list v-else>
              <v-list-item
                v-for="meal in meals"
                :key="meal.id"
                class="mb-2 bg-surface-variant"
                style="border-radius: 8px; cursor: pointer"
                @click="openMealDetail(meal)"
              >
                <template #prepend>
                  <div class="mr-3 meal-list-thumb">
                    <v-img
                      v-if="meal.image_url"
                      :src="meal.image_url"
                      :alt="meal.name"
                      width="44"
                      height="44"
                      cover
                      rounded="lg"
                    />
                    <div
                      v-else
                      class="meal-list-placeholder d-flex align-center justify-center"
                      style="
                        width: 44px;
                        height: 44px;
                        border-radius: 8px;
                        background: rgb(var(--v-theme-surface-variant));
                      "
                    >
                      <v-icon
                        :color="getMealTypeColor(meal.meal_type)"
                        size="22"
                      >
                        {{ getMealTypeIcon(meal.meal_type) }}
                      </v-icon>
                    </div>
                  </div>
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
                      <div class="font-weight-medium">
                        {{ meal.total_calories }} cal
                      </div>
                      <div class="text-caption text-grey">
                        P {{ meal.total_protein }}g · C {{ meal.total_carbs }}g
                        · F {{ meal.total_fat }}g
                      </div>
                    </div>
                    <v-btn
                      icon
                      size="small"
                      color="primary"
                      variant="text"
                      @click.stop="openEditModal(meal)"
                    >
                      <v-icon size="18">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      variant="text"
                      :loading="deletingId === meal.id"
                      @click.stop="confirmDelete(meal)"
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
            :loading="!!deletingId"
            @click="deleteMeal"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Meal detail modal -->
    <MealDetailModal
      v-model="detailModalOpen"
      :meal="selectedMeal"
      @edit="onDetailEdit"
    />

    <!-- Edit meal modal -->
    <EditMealModal
      v-model="editModalOpen"
      :meal="mealToEdit"
      @meal-updated="onMealUpdated"
    />

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
import { useMealTypeStyles } from '~/composables/useMealTypeStyles'
import {
  formatTime,
  formatDisplayDate,
  toDateIso,
  shiftDate,
} from '~/lib/date-utils'

definePageMeta({
  middleware: 'auth' as never,
  layout: 'authenticated',
})

const router = useRouter()
const { authenticatedFetch } = useAuthenticatedFetch()

const { getMealTypeColor, getMealTypeIcon } = useMealTypeStyles()

const today = new Date()
const todayIso = toDateIso(today)

const selectedDate = ref<string>(todayIso)
const pickerValue = ref<string>(todayIso)
const datePicker = ref(false)
const meals = ref<Meal[]>([])
const loadingMeals = ref(false)
const viewMode = ref<'list' | 'grid'>('list')
const deletingId = ref<string | null>(null)
const deleteDialog = ref(false)
const mealToDelete = ref<Meal | null>(null)
const editModalOpen = ref(false)
const mealToEdit = ref<Meal | null>(null)
const detailModalOpen = ref(false)
const selectedMeal = ref<Meal | null>(null)
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
    {
      label: 'Protein',
      value: `${Math.round(totals.protein)}g`,
      colorClass: 'text-success',
    },
    {
      label: 'Carbs',
      value: `${Math.round(totals.carbs)}g`,
      colorClass: 'text-warning',
    },
    {
      label: 'Fat',
      value: `${Math.round(totals.fat)}g`,
      colorClass: 'text-info',
    },
  ]
})

const formatDateForDisplay = (dateStr: string) =>
  formatDisplayDate(dateStr, todayIso)

const loadMeals = async () => {
  loadingMeals.value = true
  try {
    const res = await authenticatedFetch(
      `/api/meals/history?date=${selectedDate.value}`
    )
    if (!res.ok) throw new Error('Failed to load meals')
    const json = (await res.json()) as { data?: Meal[] }
    meals.value = json.data ?? []
  } catch {
    meals.value = []
  } finally {
    loadingMeals.value = false
  }
}

const previousDay = () => {
  selectedDate.value = shiftDate(selectedDate.value, -1)
}

const nextDay = () => {
  const next = shiftDate(selectedDate.value, 1)
  if (next <= todayIso) selectedDate.value = next
}

const onDatePicked = (value: unknown) => {
  const raw = value as string | Date | null | undefined
  if (!raw) return
  const iso = typeof raw === 'string' ? raw : toDateIso(raw as Date)
  selectedDate.value = iso
  datePicker.value = false
}

const openMealDetail = (meal: Meal) => {
  selectedMeal.value = meal
  detailModalOpen.value = true
}

const openEditModal = (meal: Meal) => {
  mealToEdit.value = meal
  editModalOpen.value = true
}

const onMealUpdated = (updated: Meal) => {
  meals.value = meals.value.map((m) => (m.id === updated.id ? updated : m))
}

const onDetailEdit = () => {
  detailModalOpen.value = false
  if (selectedMeal.value) openEditModal(selectedMeal.value)
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
    const res = await authenticatedFetch(
      `/api/meals/${mealToDelete.value.id}`,
      { method: 'DELETE' }
    )
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
  const headers = [
    'Date',
    'Time',
    'Name',
    'Type',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
    'Fiber (g)',
    'Sugar (g)',
    'Notes',
  ]
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
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
    '\n'
  )
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

<style scoped>
/* Photo grid layout: 2 cols on mobile, 3 on sm, 4 on md+ */
.meal-photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 600px) {
  .meal-photo-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 960px) {
  .meal-photo-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.meal-photo-card {
  border-radius: 10px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  position: relative;
}

.meal-photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.meal-photo-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: rgb(var(--v-theme-surface-variant));
}

.meal-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface-variant));
}

.meal-placeholder-emoji {
  font-size: 2rem;
}

.meal-photo-info {
  position: relative;
  padding-right: 28px;
}

.meal-photo-edit {
  position: absolute;
  left: 2px;
  bottom: 2px;
}

.meal-photo-delete {
  position: absolute;
  right: 2px;
  bottom: 2px;
}
</style>
