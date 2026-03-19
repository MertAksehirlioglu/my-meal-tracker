<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h6 font-weight-bold">{{ title }}</span>
      <div class="d-flex align-center gap-2">
        <v-chip v-if="meals.length > 0" color="primary" size="small">
          {{ meals.length }} meals
        </v-chip>
        <v-btn
          v-if="meals.length > 0"
          size="small"
          variant="text"
          color="primary"
          @click="emit('go-history')"
        >
          History
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="meals.length === 0" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-food</v-icon>
        <p class="text-grey">No meals logged today</p>
        <div class="d-flex flex-column gap-2 align-center mt-4">
          <v-btn
            color="primary"
            size="large"
            class="px-8 py-2"
            @click="emit('go-snap')"
          >
            Add Your First Meal
          </v-btn>
        </div>
      </div>

      <div v-else>
        <v-list>
          <v-list-item
            v-for="meal in meals"
            :key="meal.id"
            class="mb-2 meal-item"
            rounded="lg"
            @click="emit('open-detail', meal)"
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
              {{ formatTime(meal.consumed_at) }}
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center gap-2">
                <div class="text-right">
                  <div class="font-weight-medium">
                    {{ meal.total_calories }} cal
                  </div>
                  <div class="text-caption text-grey">
                    {{ meal.total_protein }}g protein
                  </div>
                </div>
                <v-btn
                  icon
                  size="small"
                  color="error"
                  variant="text"
                  :loading="deletingMealId === meal.id"
                  @click.stop="emit('confirm-delete', meal)"
                >
                  <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Meal } from '~/server/database/schemas'
import { useMealTypeStyles } from '~/composables/useMealTypeStyles'
import { formatTime } from '~/lib/date-utils'

withDefaults(
  defineProps<{
    meals: Meal[]
    deletingMealId: string | null
    title?: string
  }>(),
  { title: "Today's Meals" }
)

const emit = defineEmits<{
  'open-detail': [meal: Meal]
  'confirm-delete': [meal: Meal]
  'go-snap': []
  'go-history': []
}>()

const { getMealTypeColor, getMealTypeIcon } = useMealTypeStyles()
</script>

<style scoped>
.meal-item {
  background-color: rgb(var(--v-theme-surface-variant));
  cursor: pointer;
}
</style>
