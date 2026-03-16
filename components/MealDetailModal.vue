<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
        <div>
          <div class="text-h6 font-weight-bold">{{ meal?.name }}</div>
          <div class="text-caption text-grey mt-1">
            <v-icon size="14" class="mr-1">{{ mealTypeIcon }}</v-icon>
            {{ formattedTime }} · {{ meal?.meal_type }}
          </div>
        </div>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Meal image -->
      <div v-if="meal?.image_url" class="meal-modal-image-wrap">
        <v-img
          :src="meal.image_url"
          :alt="meal.name"
          max-height="280"
          cover
          class="w-100"
        />
      </div>

      <v-divider />

      <!-- Macro totals -->
      <div class="px-4 py-3" style="background: #f9f9f9">
        <v-row dense>
          <v-col v-for="macro in macroTotals" :key="macro.label" cols="3">
            <div class="text-center">
              <div
                class="text-subtitle-2 font-weight-bold"
                :class="macro.colorClass"
              >
                {{ macro.value }}
              </div>
              <div class="text-caption text-grey">{{ macro.label }}</div>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-divider />

      <!-- Food items -->
      <v-card-text class="pa-0" style="min-height: 120px">
        <div v-if="loading" class="d-flex justify-center align-center py-8">
          <v-progress-circular indeterminate color="primary" size="36" />
        </div>

        <div v-else-if="error" class="text-center py-6 px-4">
          <v-icon color="error" class="mb-2">mdi-alert-circle-outline</v-icon>
          <p class="text-caption text-grey">Could not load food items</p>
        </div>

        <div v-else-if="foodItems.length === 0" class="text-center py-6 px-4">
          <v-icon color="grey-lighten-1" class="mb-2">mdi-food-off</v-icon>
          <p class="text-caption text-grey">
            No food items recorded for this meal
          </p>
        </div>

        <v-list v-else density="compact" class="py-0">
          <v-list-item
            v-for="(item, index) in foodItems"
            :key="item.id"
            :class="index % 2 === 0 ? 'bg-grey-lighten-5' : ''"
            class="py-2"
          >
            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ item.name }}
              <span class="text-caption text-grey font-weight-regular ml-1">
                {{ item.quantity }}{{ item.unit }}
              </span>
            </v-list-item-title>

            <template #append>
              <div class="text-right">
                <div class="text-body-2 font-weight-medium text-primary">
                  {{ item.calories }} cal
                </div>
                <div class="text-caption text-grey">
                  P {{ item.protein }}g · C {{ item.carbs }}g · F
                  {{ item.fat }}g
                </div>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="pa-4 pt-2">
        <v-spacer />
        <v-btn
          variant="tonal"
          color="primary"
          @click="$emit('update:modelValue', false)"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Meal, FoodItem } from '~/server/database/schemas'
import { useMealTypeStyles } from '~/composables/useMealTypeStyles'
import { formatTime } from '~/lib/date-utils'

const props = defineProps<{
  modelValue: boolean
  meal: Meal | null
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { authenticatedFetch } = useAuthenticatedFetch()
const { getMealTypeIcon } = useMealTypeStyles()

const foodItems = ref<FoodItem[]>([])
const loading = ref(false)
const error = ref(false)

const mealTypeIcon = computed(() =>
  getMealTypeIcon(props.meal?.meal_type ?? '')
)

const formattedTime = computed(() => {
  if (!props.meal?.consumed_at) return ''
  return formatTime(props.meal.consumed_at)
})

const macroTotals = computed(() => {
  if (!props.meal) return []
  return [
    {
      label: 'Calories',
      value: props.meal.total_calories,
      colorClass: 'text-primary',
    },
    {
      label: 'Protein',
      value: `${Math.round(props.meal.total_protein)}g`,
      colorClass: 'text-success',
    },
    {
      label: 'Carbs',
      value: `${Math.round(props.meal.total_carbs)}g`,
      colorClass: 'text-warning',
    },
    {
      label: 'Fat',
      value: `${Math.round(props.meal.total_fat)}g`,
      colorClass: 'text-info',
    },
  ]
})

const fetchFoodItems = async (mealId: string) => {
  loading.value = true
  error.value = false
  foodItems.value = []
  try {
    const res = await authenticatedFetch(`/api/meals/${mealId}/food-items`)
    if (!res.ok) throw new Error('Failed to fetch food items')
    const json = (await res.json()) as { data?: FoodItem[] }
    foodItems.value = json.data ?? []
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.meal?.id] as const,
  ([open, mealId]) => {
    if (open && mealId) fetchFoodItems(mealId)
  }
)
</script>
