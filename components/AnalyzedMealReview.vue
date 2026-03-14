<template>
  <v-card elevation="2" rounded="lg" class="mx-auto" max-width="600">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-food-variant</v-icon>
      Review Your Meal
    </v-card-title>

    <v-card-text>
      <!-- Photo Preview -->
      <div v-if="photoUrl" class="text-center mb-4">
        <img
          :src="photoUrl"
          alt="Meal photo"
          style="max-width: 100%; max-height: 200px; border-radius: 8px"
          class="elevation-2"
        />
      </div>

      <!-- AI Analysis Results -->
      <v-alert v-if="analysisResult" type="info" class="mb-4" variant="tonal">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-robot</v-icon>
          <div>
            <strong>AI Analysis:</strong> {{ analysisResult.foodName }}
            <div class="text-caption">
              Confidence: {{ (analysisResult.confidence * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </v-alert>

      <v-form ref="form" v-model="valid" @submit.prevent="saveMeal">
        <!-- Basic Information -->
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="mealData.name"
              label="Meal Name"
              placeholder="e.g., Grilled Chicken Salad"
              :rules="[requiredRule]"
              required
              variant="outlined"
              prepend-inner-icon="mdi-food"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="mealData.meal_type"
              label="Meal Type"
              :items="mealTypes"
              :rules="[requiredRule]"
              required
              variant="outlined"
              prepend-inner-icon="mdi-clock-outline"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="mealData.consumed_at"
              label="Time Consumed"
              type="datetime-local"
              :rules="[requiredRule]"
              required
              variant="outlined"
              prepend-inner-icon="mdi-calendar"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="portionSize"
              label="Portion Size"
              :items="portionSizes"
              variant="outlined"
              prepend-inner-icon="mdi-scale"
              @update:model-value="adjustNutritionForPortion"
            />
          </v-col>
        </v-row>

        <!-- Custom Portion Grams Input -->
        <v-row v-if="portionSize === 'custom'" class="mt-n2 mb-2">
          <v-col cols="12" md="6" offset-md="6">
            <v-text-field
              v-model.number="customGrams"
              label="Custom amount (grams)"
              type="number"
              min="1"
              variant="outlined"
              prepend-inner-icon="mdi-weight-gram"
              hint="250g = 1 medium serving"
              persistent-hint
              @update:model-value="adjustNutritionForPortion(portionSize)"
            />
          </v-col>
        </v-row>

        <!-- Nutrition Information -->
        <v-divider class="my-4" />
        <div class="d-flex align-center mb-4">
          <v-icon class="mr-2" color="primary">mdi-nutrition</v-icon>
          <h3 class="text-h6">Nutrition Information</h3>
          <v-chip
            v-if="analysisResult"
            class="ml-2"
            size="small"
            color="primary"
            variant="outlined"
          >
            AI Estimated
          </v-chip>
        </div>

        <NutritionFieldsForm
          v-model:total-calories="mealData.total_calories"
          v-model:total-protein="mealData.total_protein"
          v-model:total-carbs="mealData.total_carbs"
          v-model:total-fat="mealData.total_fat"
        />

        <!-- Additional Nutrition (Optional) -->
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="mealData.total_fiber"
              label="Fiber (optional)"
              type="number"
              :rules="[positiveRule]"
              variant="outlined"
              suffix="g"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="mealData.total_sugar"
              label="Sugar (optional)"
              type="number"
              :rules="[positiveRule]"
              variant="outlined"
              suffix="g"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="mealData.notes"
              label="Notes (optional)"
              placeholder="Any additional notes..."
              variant="outlined"
            />
          </v-col>
        </v-row>

        <!-- Action Buttons -->
        <v-row class="mt-4">
          <v-col cols="12" class="d-flex gap-2">
            <v-btn
              color="primary"
              size="large"
              :loading="loading"
              :disabled="!valid"
              class="flex-grow-1"
              @click="saveMeal"
            >
              <v-icon left>mdi-content-save</v-icon>
              Save Meal
            </v-btn>
            <v-btn
              color="grey"
              variant="outlined"
              size="large"
              :disabled="loading"
              @click="$emit('cancel')"
            >
              Cancel
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useFormValidation } from '~/composables/useFormValidation'
import type {
  FoodAnalysisResult,
  NutritionInfo,
} from '@/composables/useFoodAnalysis'
// import type { Meal } from '@/server/database/schemas' // TODO: Use proper typing

interface Props {
  analysisResult?: FoodAnalysisResult | null
  photoUrl?: string
  loading?: boolean
}

interface Emits {
  (_e: 'save', _payload: unknown): void // TODO: Fix type compatibility with Meal interface
  (_e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  analysisResult: null,
  photoUrl: '',
  loading: false,
})

const emit = defineEmits<Emits>()
const { user } = useAuth()
const { checkDemoRestriction } = useDemoNotification()
const { requiredRule, positiveRule } = useFormValidation()

// Form refs
const form = ref()
const valid = ref(false)

// Portion size management
const portionSize = ref('medium')
const customGrams = ref(250)
const baseNutrition = ref<NutritionInfo | null>(null)

// Meal data
const mealData = reactive({
  name: '',
  meal_type: '',
  consumed_at: new Date().toISOString().slice(0, 16),
  total_calories: null as number | null,
  total_protein: null as number | null,
  total_carbs: null as number | null,
  total_fat: null as number | null,
  total_fiber: null as number | null,
  total_sugar: null as number | null,
  notes: '',
})

// Options
const mealTypes = [
  { title: 'Breakfast', value: 'breakfast' },
  { title: 'Lunch', value: 'lunch' },
  { title: 'Dinner', value: 'dinner' },
  { title: 'Snack', value: 'snack' },
]

const portionSizes = [
  { title: 'Small Portion (0.5×)', value: 'small' },
  { title: 'Medium Portion (1×)', value: 'medium' },
  { title: 'Large Portion (1.5×)', value: 'large' },
  { title: 'Custom (grams)', value: 'custom' },
]

// Portion multipliers — Small=0.5, Medium=1.0, Large=1.5, Custom=grams/250
const portionMultipliers: Record<string, number> = {
  small: 0.5,
  medium: 1.0,
  large: 1.5,
}

// Initialize data from analysis result
onMounted(() => {
  if (props.analysisResult) {
    mealData.name = props.analysisResult.foodName
    mealData.total_calories = props.analysisResult.nutrition.calories
    mealData.total_protein = props.analysisResult.nutrition.protein
    mealData.total_carbs = props.analysisResult.nutrition.carbs
    mealData.total_fat = props.analysisResult.nutrition.fat
    mealData.total_fiber = props.analysisResult.nutrition.fiber || null

    // Store base nutrition for portion adjustments
    baseNutrition.value = { ...props.analysisResult.nutrition }
  }
})

// Adjust nutrition based on portion size
const adjustNutritionForPortion = (newSize: string) => {
  if (!baseNutrition.value) return

  // Custom: scale by grams / 250 (250g = 1 medium serving)
  const multiplier =
    newSize === 'custom'
      ? (customGrams.value || 250) / 250
      : (portionMultipliers[newSize] ?? 1.0)

  mealData.total_calories = Math.round(
    baseNutrition.value.calories * multiplier
  )
  mealData.total_protein =
    Math.round(baseNutrition.value.protein * multiplier * 10) / 10
  mealData.total_carbs =
    Math.round(baseNutrition.value.carbs * multiplier * 10) / 10
  mealData.total_fat =
    Math.round(baseNutrition.value.fat * multiplier * 10) / 10
  if (baseNutrition.value.fiber) {
    mealData.total_fiber =
      Math.round(baseNutrition.value.fiber * multiplier * 10) / 10
  }
}

// Save meal
const saveMeal = async () => {
  if (!form.value?.validate()) return
  if (!user.value?.id) return

  // Check demo user restrictions
  if (checkDemoRestriction('saving meals')) {
    return
  }

  const mealPayload = {
    ...mealData,
    user_id: user.value.id,
    image_url: props.photoUrl || null,
    ai_confidence: props.analysisResult?.confidence || null,
    analysis_method: props.analysisResult ? 'ai' : 'manual',
    // Convert empty strings/nulls properly
    total_fiber: mealData.total_fiber || null,
    total_sugar: mealData.total_sugar || null,
    notes: mealData.notes || null,
  }

  emit('save', mealPayload)
}

// Watch for changes in analysis result
watch(
  () => props.analysisResult,
  (newResult) => {
    if (newResult) {
      mealData.name = newResult.foodName
      mealData.total_calories = newResult.nutrition.calories
      mealData.total_protein = newResult.nutrition.protein
      mealData.total_carbs = newResult.nutrition.carbs
      mealData.total_fat = newResult.nutrition.fat
      mealData.total_fiber = newResult.nutrition.fiber || null

      baseNutrition.value = { ...newResult.nutrition }
      portionSize.value = 'medium'
      customGrams.value = 250
    }
  }
)
</script>
