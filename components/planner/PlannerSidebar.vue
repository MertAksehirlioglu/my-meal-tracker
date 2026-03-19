<template>
  <div class="planner-sidebar">
    <!-- Stock header -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="d-flex align-center gap-2">
        <v-icon size="18" color="primary">mdi-fridge-outline</v-icon>
        <span class="text-subtitle-2 font-weight-bold text-primary">Stock</span>
        <v-chip
          v-if="inventory.length > 0"
          size="x-small"
          color="primary"
          variant="flat"
        >
          {{ inventory.length }}
        </v-chip>
      </div>
      <v-btn
        icon
        size="small"
        variant="tonal"
        color="primary"
        title="Add from templates"
        @click="showTemplates = true"
      >
        <v-icon size="18">mdi-plus</v-icon>
      </v-btn>
    </div>

    <!-- Inventory list -->
    <InventoryList
      :inventory="inventory"
      :portions-remaining="portionsRemaining"
      :loading="loadingInventory"
      @remove="(id) => $emit('removeInventory', id)"
    />

    <!-- Templates dialog -->
    <v-dialog v-model="showTemplates" max-width="400" scrollable>
      <v-card rounded="xl">
        <v-card-title class="pa-4 pb-3">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2">
              <v-icon color="primary" size="20">mdi-food-variant</v-icon>
              <span class="text-subtitle-1 font-weight-bold">Templates</span>
            </div>
            <div class="d-flex align-center gap-1">
              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-plus"
                @click="onNewTemplate"
              >
                New
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                @click="showTemplates = false"
              >
                <v-icon size="18">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-3 pb-1">
          <v-text-field
            v-model="search"
            placeholder="Search templates…"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            @update:model-value="onSearch"
          />
        </v-card-text>

        <v-card-text class="pa-3 pt-2">
          <div v-if="loadingTemplates" class="d-flex justify-center py-4">
            <v-progress-circular indeterminate color="primary" size="24" />
          </div>

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

          <div v-else class="d-flex flex-column">
            <TemplateCard
              v-for="tpl in templates"
              :key="tpl.id"
              :template="tpl"
              class="tpl-item"
              @add="onAddToInventory(tpl)"
              @edit="onEditTemplate(tpl)"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MealTemplate, MealInventory } from '~/server/database/schemas'
import InventoryList from './InventoryList.vue'
import TemplateCard from './TemplateCard.vue'

defineProps<{
  templates: MealTemplate[]
  inventory: MealInventory[]
  portionsRemaining: Record<string, number>
  loadingTemplates: boolean
  loadingInventory: boolean
}>()

const emit = defineEmits<{
  addToInventory: [template: MealTemplate]
  editTemplate: [template: MealTemplate]
  newTemplate: []
  searchTemplates: [query: string]
  removeInventory: [id: string]
}>()

const showTemplates = ref(false)
const search = ref('')

function onSearch(value: string | null) {
  emit('searchTemplates', value ?? '')
}

function onAddToInventory(tpl: MealTemplate) {
  showTemplates.value = false
  emit('addToInventory', tpl)
}

function onEditTemplate(tpl: MealTemplate) {
  showTemplates.value = false
  emit('editTemplate', tpl)
}

function onNewTemplate() {
  showTemplates.value = false
  emit('newTemplate')
}
</script>

<style scoped>
.planner-sidebar {
  height: 100%;
  overflow-y: auto;
  padding: 0 4px;
}

.tpl-item {
  margin-bottom: 12px;
}
.tpl-item:last-child {
  margin-bottom: 0;
}
</style>
