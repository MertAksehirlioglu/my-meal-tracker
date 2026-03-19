<template>
  <div class="template-list">
    <!-- Search -->
    <v-text-field
      v-model="search"
      placeholder="Search templates…"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-3"
      @update:model-value="onSearch"
    />

    <!-- New template button -->
    <v-btn
      block
      variant="tonal"
      color="primary"
      prepend-icon="mdi-plus"
      class="mb-3"
      @click="$emit('new')"
    >
      New Template
    </v-btn>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-4">
      <v-progress-circular indeterminate color="primary" size="24" />
    </div>

    <!-- Empty state -->
    <div v-else-if="templates.length === 0" class="text-center py-6">
      <v-icon size="36" color="grey-lighten-1">mdi-food-variant</v-icon>
      <p class="text-body-2 text-medium-emphasis mt-2">
        {{
          search
            ? 'No templates match your search'
            : 'No templates yet — create your first one!'
        }}
      </p>
    </div>

    <!-- List -->
    <div v-else class="d-flex flex-column">
      <TemplateCard
        v-for="tpl in templates"
        :key="tpl.id"
        :template="tpl"
        class="tpl-item"
        @add="(t) => $emit('add', t)"
        @edit="(t) => $emit('edit', t)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MealTemplate } from '~/server/database/schemas'
import TemplateCard from './TemplateCard.vue'

defineProps<{
  templates: MealTemplate[]
  loading: boolean
}>()

const emit = defineEmits<{
  add: [template: MealTemplate]
  edit: [template: MealTemplate]
  new: []
  search: [query: string]
}>()

const search = ref('')

function onSearch(value: string | null) {
  emit('search', value ?? '')
}
</script>

<style scoped>
.tpl-item {
  margin-bottom: 12px;
}
.tpl-item:last-child {
  margin-bottom: 0;
}
</style>
