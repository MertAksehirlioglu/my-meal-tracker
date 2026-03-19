<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
        <span class="text-h6 font-weight-bold">Edit Meal</span>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="formValid">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="Meal Name"
                variant="outlined"
                :rules="[rules.required]"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.meal_type"
                label="Meal Type"
                variant="outlined"
                :items="mealTypeOptions"
                :rules="[rules.required]"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.consumed_at"
                label="Date & Time"
                variant="outlined"
                type="datetime-local"
                :rules="[rules.required]"
                required
              />
            </v-col>
          </v-row>

          <NutritionFieldsForm
            :total-calories="form.total_calories"
            :total-protein="form.total_protein"
            :total-carbs="form.total_carbs"
            :total-fat="form.total_fat"
            @update:total-calories="form.total_calories = $event"
            @update:total-protein="form.total_protein = $event"
            @update:total-carbs="form.total_carbs = $event"
            @update:total-fat="form.total_fat = $event"
          />

          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.total_fiber"
                label="Fiber (optional)"
                variant="outlined"
                type="number"
                suffix="g"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.total_sugar"
                label="Sugar (optional)"
                variant="outlined"
                type="number"
                suffix="g"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="Notes (optional)"
                variant="outlined"
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="saving"
          :disabled="!formValid || saving"
          @click="save"
        >
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Meal } from '~/server/database/schemas'
import { useFormValidation } from '~/composables/useFormValidation'

const props = defineProps<{
  modelValue: boolean
  meal: Meal | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'meal-updated': [meal: Meal]
}>()

const { authenticatedFetch } = useAuthenticatedFetch()
const rules = useFormValidation()

const formRef = ref()
const formValid = ref(false)
const saving = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

const mealTypeOptions = ['breakfast', 'lunch', 'dinner', 'snack']

interface FormState {
  name: string
  meal_type: string
  consumed_at: string
  total_calories: number | null
  total_protein: number | null
  total_carbs: number | null
  total_fat: number | null
  total_fiber: number | null
  total_sugar: number | null
  notes: string
}

const form = ref<FormState>({
  name: '',
  meal_type: 'lunch',
  consumed_at: '',
  total_calories: null,
  total_protein: null,
  total_carbs: null,
  total_fat: null,
  total_fiber: null,
  total_sugar: null,
  notes: '',
})

const toLocalDatetimeString = (isoString: string): string => {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

watch(
  () => [props.modelValue, props.meal] as const,
  ([open, meal]) => {
    if (open && meal) {
      form.value = {
        name: meal.name,
        meal_type: meal.meal_type,
        consumed_at: toLocalDatetimeString(meal.consumed_at),
        total_calories: meal.total_calories,
        total_protein: meal.total_protein,
        total_carbs: meal.total_carbs,
        total_fat: meal.total_fat,
        total_fiber: meal.total_fiber ?? null,
        total_sugar: meal.total_sugar ?? null,
        notes: meal.notes ?? '',
      }
    }
  }
)

const save = async () => {
  if (!props.meal) return
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  saving.value = true
  try {
    const res = await authenticatedFetch(`/api/meals/${props.meal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form.value,
        consumed_at: new Date(form.value.consumed_at).toISOString(),
      }),
    })

    if (!res.ok) throw new Error('Failed to update meal')

    const json = (await res.json()) as { data?: Meal }
    if (json.data) emit('meal-updated', json.data)

    snackbarMessage.value = 'Meal updated successfully'
    snackbarColor.value = 'success'
    snackbar.value = true
    emit('update:modelValue', false)
  } catch {
    snackbarMessage.value = 'Could not update meal'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    saving.value = false
  }
}
</script>
