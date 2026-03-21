<template>
  <v-dialog
    v-model="show"
    persistent
    :max-width="mobile ? undefined : 480"
    :fullscreen="mobile"
  >
    <v-card rounded="lg">
      <v-card-title class="text-h6 font-weight-bold px-6 pt-6 pb-1">
        Welcome to MealSnap!
      </v-card-title>
      <v-card-subtitle class="px-6 pb-0">
        Step {{ step }} of 3 — Set your nutrition goals
      </v-card-subtitle>
      <v-progress-linear
        :model-value="(step / 3) * 100"
        color="primary"
        height="3"
        class="mt-3"
      />

      <v-card-text class="pa-6">
        <!-- Step 1: Personal Info -->
        <template v-if="step === 1">
          <p class="text-body-2 text-medium-emphasis mb-4">
            We use the Mifflin-St Jeor formula to estimate your daily calorie
            needs.
          </p>
          <v-btn-toggle
            v-model="form.sex"
            mandatory
            color="primary"
            class="mb-4 w-100"
            divided
            rounded="lg"
          >
            <v-btn value="male" class="flex-1-1">Male</v-btn>
            <v-btn value="female" class="flex-1-1">Female</v-btn>
          </v-btn-toggle>
          <v-text-field
            v-model.number="form.age"
            label="Age"
            type="number"
            suffix="years"
            variant="outlined"
            density="compact"
            :min="10"
            :max="120"
            class="mb-3"
          />
          <v-text-field
            v-model.number="form.heightCm"
            label="Height"
            type="number"
            suffix="cm"
            variant="outlined"
            density="compact"
            :min="100"
            :max="250"
            class="mb-3"
          />
          <v-text-field
            v-model.number="form.weightKg"
            label="Weight"
            type="number"
            suffix="kg"
            variant="outlined"
            density="compact"
            :min="30"
            :max="300"
          />
        </template>

        <!-- Step 2: Activity Level + Goal -->
        <template v-if="step === 2">
          <p class="text-subtitle-2 font-weight-bold mb-2">Activity Level</p>
          <v-radio-group v-model="form.activityLevel" class="mb-2" hide-details>
            <v-radio
              v-for="opt in activityOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
              density="compact"
            />
          </v-radio-group>
          <v-divider class="my-4" />
          <p class="text-subtitle-2 font-weight-bold mb-3">My Goal</p>
          <v-btn-toggle
            v-model="form.goal"
            mandatory
            color="primary"
            divided
            rounded="lg"
            class="w-100"
          >
            <v-btn value="lose" class="flex-1-1 text-caption">
              Lose Weight
            </v-btn>
            <v-btn value="maintain" class="flex-1-1 text-caption">
              Maintain
            </v-btn>
            <v-btn value="gain" class="flex-1-1 text-caption">
              Gain Muscle
            </v-btn>
          </v-btn-toggle>
        </template>

        <!-- Step 3: Review & Save -->
        <template v-if="step === 3">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Your personalized daily nutrition targets:
          </p>
          <v-list density="compact" rounded="lg" border class="mb-3">
            <v-list-item
              prepend-icon="mdi-fire"
              title="Calories"
              :subtitle="calculatedGoals.calories + ' kcal'"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-arm-flex"
              title="Protein"
              :subtitle="calculatedGoals.protein + 'g'"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-barley"
              title="Carbs"
              :subtitle="calculatedGoals.carbs + 'g'"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-water"
              title="Fat"
              :subtitle="calculatedGoals.fat + 'g'"
            />
          </v-list>
          <v-alert
            v-if="saveError"
            type="error"
            density="compact"
            variant="tonal"
          >
            {{ saveError }}
          </v-alert>
        </template>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-0">
        <v-btn v-if="step > 1" variant="text" @click="step--">Back</v-btn>
        <v-spacer />
        <v-btn variant="text" color="grey" @click="skip">Skip</v-btn>
        <v-btn
          v-if="step < 3"
          color="primary"
          variant="flat"
          :disabled="!canProceed"
          @click="step++"
        >
          Next
        </v-btn>
        <v-btn
          v-else
          color="primary"
          variant="flat"
          :loading="saving"
          @click="finish"
        >
          Save & Start
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuth } from '~/composables/useAuth'

const STORAGE_KEY = 'mealsnap-onboarding-complete'

const { mobile } = useDisplay()
const { isDemoUser } = useAuth()

const show = ref(false)
const step = ref(1)
const saving = ref(false)
const saveError = ref<string | null>(null)

const form = ref({
  sex: 'male' as 'male' | 'female',
  age: null as number | null,
  heightCm: null as number | null,
  weightKg: null as number | null,
  activityLevel: 'moderate',
  goal: 'maintain' as 'lose' | 'maintain' | 'gain',
})

const activityOptions = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Lightly active (1–3 days/week)' },
  { value: 'moderate', label: 'Moderately active (3–5 days/week)' },
  { value: 'active', label: 'Very active (6–7 days/week)' },
  { value: 'extra', label: 'Extra active (physical job + training)' },
]

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
}

const goalAdjustments: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
}

const calculatedGoals = computed(() => {
  const { sex, age, heightCm, weightKg, activityLevel, goal } = form.value
  if (!age || !heightCm || !weightKg) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 }
  }
  const bmr =
    sex === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  const tdee = bmr * (activityMultipliers[activityLevel] ?? 1.55)
  const calories = Math.round(tdee + (goalAdjustments[goal] ?? 0))
  const protein = Math.round((calories * 0.3) / 4)
  const carbs = Math.round((calories * 0.4) / 4)
  const fat = Math.round((calories * 0.3) / 9)
  return { calories, protein, carbs, fat }
})

const canProceed = computed(() => {
  if (step.value === 1) {
    return (
      form.value.age &&
      form.value.heightCm &&
      form.value.weightKg &&
      form.value.age > 0 &&
      form.value.heightCm > 0 &&
      form.value.weightKg > 0
    )
  }
  return true
})

function skip() {
  localStorage.setItem(STORAGE_KEY, '1')
  show.value = false
}

async function finish() {
  saving.value = true
  saveError.value = null
  try {
    const { authenticatedFetch } = useAuthenticatedFetch()
    const goals = calculatedGoals.value
    await authenticatedFetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_calories: goals.calories,
        target_protein: goals.protein,
        target_carbs: goals.carbs,
        target_fat: goals.fat,
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
      }),
    })
  } catch {
    // Goals API may not be available yet; onboarding completes regardless
  } finally {
    saving.value = false
  }
  localStorage.setItem(STORAGE_KEY, '1')
  show.value = false
}

onMounted(() => {
  if (!isDemoUser.value && !localStorage.getItem(STORAGE_KEY)) {
    show.value = true
  }
})
</script>
