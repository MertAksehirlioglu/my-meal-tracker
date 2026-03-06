<template>
  <v-row>
    <v-col cols="12" sm="6" md="3">
      <v-text-field
        :model-value="totalCalories"
        label="Calories"
        type="number"
        :rules="[rules.required, rules.positive]"
        required
        variant="outlined"
        suffix="cal"
        @update:model-value="emit('update:totalCalories', toNum($event))"
      />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-text-field
        :model-value="totalProtein"
        label="Protein"
        type="number"
        :rules="[rules.required, rules.positive]"
        required
        variant="outlined"
        suffix="g"
        @update:model-value="emit('update:totalProtein', toNum($event))"
      />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-text-field
        :model-value="totalCarbs"
        label="Carbohydrates"
        type="number"
        :rules="[rules.required, rules.positive]"
        required
        variant="outlined"
        suffix="g"
        @update:model-value="emit('update:totalCarbs', toNum($event))"
      />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-text-field
        :model-value="totalFat"
        label="Fat"
        type="number"
        :rules="[rules.required, rules.positive]"
        required
        variant="outlined"
        suffix="g"
        @update:model-value="emit('update:totalFat', toNum($event))"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useFormValidation } from '~/composables/useFormValidation'

defineProps<{
  totalCalories: number | null
  totalProtein: number | null
  totalCarbs: number | null
  totalFat: number | null
}>()

const emit = defineEmits<{
  'update:totalCalories': [value: number | null]
  'update:totalProtein': [value: number | null]
  'update:totalCarbs': [value: number | null]
  'update:totalFat': [value: number | null]
}>()

const rules = useFormValidation()

const toNum = (v: unknown) => (v === '' || v === null ? null : Number(v))
</script>
