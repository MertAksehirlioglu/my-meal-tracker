<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-body-2 text-grey">
        Add ingredients individually — totals are computed automatically.
      </div>
      <v-btn
        size="small"
        prepend-icon="mdi-plus"
        variant="tonal"
        color="primary"
        @click="addIngredient"
      >
        Add Ingredient
      </v-btn>
    </div>

    <div v-if="ingredients.length === 0" class="text-center py-6 rounded-lg bg-surface-variant">
      <v-icon color="grey-lighten-1" size="32" class="mb-2">mdi-food-variant</v-icon>
      <p class="text-caption text-grey">No ingredients yet. Click "Add Ingredient" to start.</p>
    </div>

    <div v-else>
      <div
        v-for="(row, i) in ingredients"
        :key="i"
        class="ingredient-row mb-2 pa-3 rounded-lg bg-surface-variant"
      >
        <v-row dense align="center">
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="row.name"
              density="compact"
              variant="outlined"
              hide-details
              placeholder="Ingredient name"
              label="Name"
            />
          </v-col>
          <v-col cols="5" sm="2">
            <v-text-field
              v-model.number="row.quantity"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              step="1"
              label="Qty"
            />
          </v-col>
          <v-col cols="5" sm="2">
            <v-select
              v-model="row.unit"
              density="compact"
              variant="outlined"
              hide-details
              :items="UNITS"
              label="Unit"
            />
          </v-col>
          <v-col cols="2" sm="1" class="d-flex justify-end">
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="error"
              @click="removeIngredient(i)"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="3">
            <v-text-field
              v-model.number="row.calories"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              label="Calories"
              suffix="kcal"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <v-text-field
              v-model.number="row.protein"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              step="0.1"
              label="Protein"
              suffix="g"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <v-text-field
              v-model.number="row.carbs"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              step="0.1"
              label="Carbs"
              suffix="g"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <v-text-field
              v-model.number="row.fat"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
              min="0"
              step="0.1"
              label="Fat"
              suffix="g"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Totals summary -->
      <v-sheet
        rounded="lg"
        color="primary"
        class="pa-3 mt-3"
      >
        <div class="text-caption text-white mb-1 font-weight-medium">Recipe Totals</div>
        <v-row dense>
          <v-col cols="3" class="text-center">
            <div class="text-subtitle-2 font-weight-bold text-white">{{ totals.calories }}</div>
            <div class="text-caption" style="color: rgba(255,255,255,0.8)">kcal</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-subtitle-2 font-weight-bold text-white">{{ totals.protein }}g</div>
            <div class="text-caption" style="color: rgba(255,255,255,0.8)">protein</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-subtitle-2 font-weight-bold text-white">{{ totals.carbs }}g</div>
            <div class="text-caption" style="color: rgba(255,255,255,0.8)">carbs</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-subtitle-2 font-weight-bold text-white">{{ totals.fat }}g</div>
            <div class="text-caption" style="color: rgba(255,255,255,0.8)">fat</div>
          </v-col>
        </v-row>
      </v-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const UNITS = ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'serving']

const ingredients = ref<RecipeIngredient[]>([])

const totals = computed(() => ({
  calories: Math.round(
    ingredients.value.reduce((s, i) => s + (Number(i.calories) || 0), 0)
  ),
  protein:
    Math.round(
      ingredients.value.reduce((s, i) => s + (Number(i.protein) || 0), 0) * 10
    ) / 10,
  carbs:
    Math.round(
      ingredients.value.reduce((s, i) => s + (Number(i.carbs) || 0), 0) * 10
    ) / 10,
  fat:
    Math.round(
      ingredients.value.reduce((s, i) => s + (Number(i.fat) || 0), 0) * 10
    ) / 10,
}))

function addIngredient() {
  ingredients.value.push({
    name: '',
    quantity: 100,
    unit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
}

function removeIngredient(index: number) {
  ingredients.value.splice(index, 1)
}

defineExpose({ ingredients, totals })
</script>
