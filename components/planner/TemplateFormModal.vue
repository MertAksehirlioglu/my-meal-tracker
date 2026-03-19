<template>
  <v-dialog v-model="open" max-width="480" persistent>
    <v-card rounded="xl">
      <v-card-title class="pt-5 px-5 text-body-1 font-weight-bold">
        {{ isEditing ? 'Edit Template' : 'New Template' }}
      </v-card-title>

      <v-card-text class="px-5 pb-2">
        <v-text-field
          v-model="form.name"
          label="Meal name"
          variant="outlined"
          density="compact"
          class="mb-3"
          :error-messages="errors.name"
        />

        <div class="d-flex gap-3 mb-3">
          <v-text-field
            v-model.number="form.calories"
            label="Calories"
            type="number"
            variant="outlined"
            density="compact"
            suffix="kcal"
            :error-messages="errors.calories"
          />
          <v-text-field
            v-model="form.serving_size"
            label="Serving size"
            variant="outlined"
            density="compact"
            placeholder="e.g. 1 bowl"
          />
        </div>

        <div class="d-flex gap-3 mb-3">
          <v-text-field
            v-model.number="form.protein"
            label="Protein"
            type="number"
            variant="outlined"
            density="compact"
            suffix="g"
          />
          <v-text-field
            v-model.number="form.carbs"
            label="Carbs"
            type="number"
            variant="outlined"
            density="compact"
            suffix="g"
          />
          <v-text-field
            v-model.number="form.fat"
            label="Fat"
            type="number"
            variant="outlined"
            density="compact"
            suffix="g"
          />
        </div>

        <v-textarea
          v-model="form.notes"
          label="Notes (optional)"
          variant="outlined"
          density="compact"
          rows="2"
          auto-grow
        />
      </v-card-text>

      <v-card-actions class="px-5 pb-5 gap-2">
        <v-spacer />
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          @click="submit"
        >
          {{ isEditing ? 'Save changes' : 'Create template' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MealTemplate } from '~/server/database/schemas'

type FormData = {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving_size: string
  notes: string
}

const props = defineProps<{
  modelValue: boolean
  template?: MealTemplate | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: FormData]
}>()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEditing = computed(() => !!props.template)

const blankForm = (): FormData => ({
  name: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  serving_size: '',
  notes: '',
})

const form = ref<FormData>(blankForm())
const errors = ref<Partial<Record<keyof FormData, string>>>({})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.value = props.template
        ? {
            name: props.template.name,
            calories: props.template.calories,
            protein: props.template.protein,
            carbs: props.template.carbs,
            fat: props.template.fat,
            serving_size: props.template.serving_size ?? '',
            notes: props.template.notes ?? '',
          }
        : blankForm()
      errors.value = {}
    }
  }
)

function validate(): boolean {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = 'Name is required'
  if (form.value.calories < 0) errors.value.calories = 'Must be ≥ 0'
  return Object.keys(errors.value).length === 0
}

function submit() {
  if (!validate()) return
  emit('submit', { ...form.value })
}

function cancel() {
  open.value = false
}
</script>
