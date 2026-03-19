<template>
  <v-card class="template-card" variant="outlined" rounded="lg">
    <v-card-text class="pa-3">
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-body-2 font-weight-semibold text-truncate">{{
          template.name
        }}</span>
        <div class="d-flex align-center gap-1 flex-shrink-0 ml-2">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="grey"
            @click.stop="$emit('edit', template)"
          >
            <v-icon size="16">mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="flat"
            color="primary"
            @click.stop="$emit('add', template)"
          >
            <v-icon size="18">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>

      <div class="d-flex gap-3 text-caption text-medium-emphasis flex-wrap">
        <span>
          <v-icon size="12" class="mr-1">mdi-fire</v-icon
          >{{ template.calories }} kcal
        </span>
        <span>P {{ template.protein }}g</span>
        <span>C {{ template.carbs }}g</span>
        <span>F {{ template.fat }}g</span>
      </div>

      <div v-if="template.serving_size" class="text-caption text-disabled mt-1">
        {{ template.serving_size }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { MealTemplate } from '~/server/database/schemas'

defineProps<{
  template: MealTemplate
}>()

defineEmits<{
  add: [template: MealTemplate]
  edit: [template: MealTemplate]
}>()
</script>

<style scoped>
.template-card {
  cursor: default;
  transition: box-shadow 0.15s;
}
.template-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
