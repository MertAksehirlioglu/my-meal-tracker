<template>
  <v-container class="fill-height pa-4" style="max-width: 800px">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-food</v-icon>
            Manual Meal Entry
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="saveMeal">
              <!-- Basic Information -->
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="mealData.name"
                    label="Meal Name"
                    placeholder="e.g., Grilled Chicken Salad"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="mealData.meal_type"
                    label="Meal Type"
                    :items="mealTypes"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="mealData.consumed_at"
                    label="Time Consumed"
                    type="datetime-local"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="mealData.serving_size"
                    label="Serving Size (optional)"
                    placeholder="e.g., 1 cup, 200g"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <!-- Mode toggle -->
              <v-divider class="my-4" />
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6">
                  {{ recipeMode ? 'Recipe Builder' : 'Nutrition Information' }}
                </h3>
                <v-btn-toggle
                  v-model="recipeMode"
                  density="compact"
                  color="primary"
                  variant="outlined"
                  mandatory
                >
                  <v-btn :value="false" size="small">
                    <v-icon size="16" class="mr-1">mdi-pencil</v-icon>
                    Simple
                  </v-btn>
                  <v-btn :value="true" size="small">
                    <v-icon size="16" class="mr-1">mdi-format-list-bulleted</v-icon>
                    Recipe
                  </v-btn>
                </v-btn-toggle>
              </div>

              <!-- Recipe mode: ingredient builder -->
              <template v-if="recipeMode">
                <RecipeBuilder ref="recipeBuilderRef" />
                <v-alert
                  v-if="recipeMode && recipeBuilderRef?.ingredients.length === 0"
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mt-3"
                >
                  Add at least one ingredient to save in Recipe mode.
                </v-alert>
              </template>

              <!-- Simple mode: manual nutrition entry -->
              <template v-else>
                <NutritionFieldsForm
                  v-model:total-calories="mealData.total_calories"
                  v-model:total-protein="mealData.total_protein"
                  v-model:total-carbs="mealData.total_carbs"
                  v-model:total-fat="mealData.total_fat"
                />

                <!-- Additional Nutrition (Optional) -->
                <v-row>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model.number="mealData.fiber"
                      label="Fiber"
                      type="number"
                      :rules="[positiveRule]"
                      variant="outlined"
                      suffix="g"
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model.number="mealData.sugar"
                      label="Sugar"
                      type="number"
                      :rules="[positiveRule]"
                      variant="outlined"
                      suffix="g"
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model.number="mealData.sodium"
                      label="Sodium"
                      type="number"
                      :rules="[positiveRule]"
                      variant="outlined"
                      suffix="mg"
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model.number="mealData.cholesterol"
                      label="Cholesterol"
                      type="number"
                      :rules="[positiveRule]"
                      variant="outlined"
                      suffix="mg"
                    />
                  </v-col>
                </v-row>
              </template>

              <!-- Notes -->
              <v-row class="mt-2">
                <v-col cols="12">
                  <v-textarea
                    v-model="mealData.notes"
                    label="Notes (optional)"
                    placeholder="Any additional notes about this meal..."
                    variant="outlined"
                    rows="3"
                    auto-grow
                  />
                </v-col>
              </v-row>

              <!-- Action Buttons -->
              <v-row class="mt-2">
                <v-col cols="12">
                  <!-- Error/Success Notification -->
                  <v-alert
                    v-if="latestError"
                    :type="latestError.type"
                    closable
                    class="mb-4"
                    @click:close="clearError()"
                  >
                    {{ latestError.message }}
                  </v-alert>

                  <v-btn
                    color="primary"
                    size="large"
                    :loading="loading"
                    :disabled="!canSave"
                    block
                    @click="saveMeal"
                  >
                    <v-icon left>mdi-content-save</v-icon>
                    Save Meal
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useFormValidation } from '~/composables/useFormValidation'
import { useErrorHandling } from '~/composables/useErrorHandling'
import type { Meal } from '~/server/database/schemas'

definePageMeta({
  middleware: 'auth' as never,
  layout: 'authenticated',
})

const router = useRouter()
const { user } = useAuth()
const { checkDemoRestriction } = useDemoNotification()
const { requiredRule, positiveRule } = useFormValidation()
const { withErrorHandling, latestError, clearError, addSuccess } =
  useErrorHandling()

const form = ref()
const valid = ref(false)
const loading = ref(false)
const recipeMode = ref(false)
const recipeBuilderRef = ref<InstanceType<
  typeof import('~/components/RecipeBuilder.vue').default
> | null>(null)

const rules = { required: requiredRule }

const mealData = reactive({
  name: '',
  meal_type: '',
  consumed_at: new Date().toISOString().slice(0, 16),
  serving_size: '',
  total_calories: null as number | null,
  total_protein: null as number | null,
  total_carbs: null as number | null,
  total_fat: null as number | null,
  fiber: null as number | null,
  sugar: null as number | null,
  sodium: null as number | null,
  cholesterol: null as number | null,
  notes: '',
})

const mealTypes = [
  { title: 'Breakfast', value: 'breakfast' },
  { title: 'Lunch', value: 'lunch' },
  { title: 'Dinner', value: 'dinner' },
  { title: 'Snack', value: 'snack' },
]

const canSave = computed(() => {
  if (!valid.value) return false
  if (recipeMode.value) {
    return (recipeBuilderRef.value?.ingredients.length ?? 0) > 0
  }
  return true
})

const saveMeal = async () => {
  if (!form.value?.validate()) return
  if (!user.value?.id) return
  if (checkDemoRestriction('saving meals')) return

  loading.value = true
  await withErrorHandling(
    async () => {
      const { authenticatedFetch } = useAuthenticatedFetch()

      let payload: Record<string, unknown>

      if (recipeMode.value && recipeBuilderRef.value) {
        const { ingredients, totals } = recipeBuilderRef.value
        if (ingredients.length === 0) {
          throw new Error('Add at least one ingredient in Recipe mode')
        }
        payload = {
          ...mealData,
          user_id: user.value?.id ?? '',
          serving_size: mealData.serving_size || null,
          notes: mealData.notes || null,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fat: totals.fat,
          total_fiber: null,
          total_sugar: null,
        }

        const mealRes = (await authenticatedFetch('/api/meals', {
          method: 'POST',
          body: JSON.stringify(payload),
        }).then((r) => r.json())) as { success: boolean; data: Meal }

        if (!mealRes.success) throw new Error('Failed to save meal')

        await authenticatedFetch(
          `/api/meals/${mealRes.data.id}/food-items`,
          {
            method: 'POST',
            body: JSON.stringify({ food_items: ingredients }),
          }
        )
      } else {
        payload = {
          ...mealData,
          user_id: user.value?.id ?? '',
          serving_size: mealData.serving_size || null,
          fiber: mealData.fiber || null,
          sugar: mealData.sugar || null,
          sodium: mealData.sodium || null,
          cholesterol: mealData.cholesterol || null,
          notes: mealData.notes || null,
        }

        const response = (await authenticatedFetch('/api/meals', {
          method: 'POST',
          body: JSON.stringify(payload),
        }).then((r) => r.json())) as { success: boolean; data: Meal }

        if (!response.success) throw new Error('Failed to save meal')
      }

      addSuccess('Meal saved successfully!')
      router.push('/home')
    },
    'saving meal',
    false
  )
  loading.value = false
}
</script>
