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

              <!-- Nutrition Information -->
              <v-divider class="my-4" />
              <h3 class="text-h6 mb-4">Nutrition Information</h3>

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

              <!-- Notes -->
              <v-row>
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
              <v-row class="mt-6">
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
                    :disabled="!valid"
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useFormValidation } from '~/composables/useFormValidation'
import { useErrorHandling } from '~/composables/useErrorHandling'

// Page meta
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

// Form refs
const form = ref()
const valid = ref(false)
const loading = ref(false)

// Create rules object for template bindings
const rules = { required: requiredRule }

// Meal data
const mealData = reactive({
  name: '',
  meal_type: '',
  consumed_at: new Date().toISOString().slice(0, 16), // Current date/time
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

// Meal types
const mealTypes = [
  { title: 'Breakfast', value: 'breakfast' },
  { title: 'Lunch', value: 'lunch' },
  { title: 'Dinner', value: 'dinner' },
  { title: 'Snack', value: 'snack' },
]

// Methods
const saveMeal = async () => {
  if (!form.value?.validate()) return
  if (!user.value?.id) return

  // Check demo user restrictions
  if (checkDemoRestriction('saving meals')) {
    return
  }

  loading.value = true
  await withErrorHandling(
    async () => {
      const mealPayload = {
        ...mealData,
        user_id: user.value?.id || '',
        // Convert empty strings to null for optional fields
        serving_size: mealData.serving_size || null,
        fiber: mealData.fiber || null,
        sugar: mealData.sugar || null,
        sodium: mealData.sodium || null,
        cholesterol: mealData.cholesterol || null,
        notes: mealData.notes || null,
      }

      const { authenticatedFetch } = useAuthenticatedFetch()
      const response = (await authenticatedFetch('/api/meals', {
        method: 'POST',
        body: JSON.stringify(mealPayload),
      }).then((r) => r.json())) as { success: boolean; message?: string }

      if (response.success) {
        addSuccess('Meal saved successfully!')
        router.push('/home')
      } else {
        throw new Error(response.message || 'Failed to save meal')
      }
    },
    'saving meal',
    false // Don't use built-in loading state
  )
  loading.value = false
}
</script>
