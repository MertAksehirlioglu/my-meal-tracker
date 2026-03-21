<template>
  <v-container fluid class="planner-page pa-4">
    <!-- Header row -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-4">
      <h2 class="text-h6 font-weight-bold text-primary">Meal Planner</h2>

      <WeekSelector
        :label="weekLabel"
        :is-current-week="isThisWeek"
        @prev="goToPrevWeek"
        @next="goToNextWeek"
        @today="goToCurrentWeek"
      />
    </div>

    <!-- Error banner -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- Desktop layout: sidebar + calendar -->
    <div class="planner-layout">
      <!-- Sidebar -->
      <v-card class="planner-sidebar-card" variant="outlined" rounded="lg">
        <v-card-text class="pa-3">
          <PlannerSidebar
            :templates="templates"
            :inventory="inventory"
            :portions-remaining="portionsRemaining"
            :loading-templates="loadingTemplates"
            :loading-inventory="loadingInventory"
            @add-to-inventory="openAddToInventory"
            @edit-template="openEditTemplate"
            @new-template="openNewTemplate"
            @search-templates="fetchTemplates"
            @remove-inventory="handleRemoveInventory"
          />
          <!-- Generate Shopping List -->
          <v-btn
            v-if="inventory.length > 0"
            block
            variant="tonal"
            color="secondary"
            size="small"
            prepend-icon="mdi-cart-outline"
            class="mt-3"
            @click="generateShoppingList"
          >
            Generate Shopping List
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Calendar -->
      <v-card
        class="planner-calendar-card flex-1-1"
        variant="outlined"
        rounded="lg"
      >
        <v-card-text class="pa-3">
          <div v-if="loadingSlots" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <PlannerCalendar
            v-else
            :week-start="weekStart"
            :slots="slots"
            @drop="handleDrop"
            @confirm="handleConfirm"
            @remove="handleRemoveSlot"
          />
        </v-card-text>
      </v-card>
    </div>

    <!-- Add to Inventory modal -->
    <AddToInventoryModal
      v-model="showAddInventory"
      :template="selectedTemplate"
      :loading="addingToInventory"
      @confirm="handleAddToInventory"
    />

    <!-- Template form modal -->
    <TemplateFormModal
      v-model="showTemplateForm"
      :template="editingTemplate"
      :loading="savingTemplate"
      @submit="handleSaveTemplate"
    />

    <!-- Snackbar feedback -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MealTemplate, MealInventory } from '~/server/database/schemas'
import { useWeekNavigation } from '~/composables/useWeekNavigation'
import { useMealPlanner } from '~/composables/useMealPlanner'
import WeekSelector from '~/components/planner/WeekSelector.vue'
import PlannerSidebar from '~/components/planner/PlannerSidebar.vue'
import PlannerCalendar from '~/components/planner/PlannerCalendar.vue'
import AddToInventoryModal from '~/components/planner/AddToInventoryModal.vue'
import TemplateFormModal from '~/components/planner/TemplateFormModal.vue'

definePageMeta({ layout: 'authenticated' })

// ── Week navigation ────────────────────────────────────────────────────────
const {
  weekStart,
  weekLabel,
  isThisWeek,
  goToPrevWeek,
  goToNextWeek,
  goToCurrentWeek,
} = useWeekNavigation()

// ── Planner state ──────────────────────────────────────────────────────────
const {
  templates,
  inventory,
  slots,
  loadingTemplates,
  loadingInventory,
  loadingSlots,
  error,
  portionsRemaining,
  fetchTemplates,
  fetchWeekData,
  createTemplate,
  updateTemplate,
  addToInventory,
  removeFromInventory,
  assignSlot,
  confirmSlot,
  removeSlot,
} = useMealPlanner(weekStart)

// ── Modal state ────────────────────────────────────────────────────────────
const showAddInventory = ref(false)
const selectedTemplate = ref<MealTemplate | null>(null)
const addingToInventory = ref(false)

const showTemplateForm = ref(false)
const editingTemplate = ref<MealTemplate | null>(null)
const savingTemplate = ref(false)

const snackbar = ref({ show: false, message: '', color: 'success' })

// ── Snackbar helper ────────────────────────────────────────────────────────
function notify(message: string, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// ── Template handlers ──────────────────────────────────────────────────────
function openNewTemplate() {
  editingTemplate.value = null
  showTemplateForm.value = true
}

function openEditTemplate(template: MealTemplate) {
  editingTemplate.value = template
  showTemplateForm.value = true
}

async function handleSaveTemplate(data: Partial<MealTemplate>) {
  savingTemplate.value = true
  try {
    if (editingTemplate.value) {
      await updateTemplate(editingTemplate.value.id, data)
      notify('Template updated')
    } else {
      await createTemplate(
        data as Omit<
          MealTemplate,
          'id' | 'user_id' | 'created_at' | 'updated_at'
        >
      )
      notify('Template created')
    }
    showTemplateForm.value = false
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Failed to save template', 'error')
  } finally {
    savingTemplate.value = false
  }
}

// ── Inventory handlers ─────────────────────────────────────────────────────
function openAddToInventory(template: MealTemplate) {
  selectedTemplate.value = template
  showAddInventory.value = true
}

async function handleAddToInventory(quantity: number) {
  if (!selectedTemplate.value) return
  addingToInventory.value = true
  try {
    await addToInventory(selectedTemplate.value.id, quantity)
    notify(`Added ${quantity} portion${quantity !== 1 ? 's' : ''} to this week`)
    showAddInventory.value = false
  } catch (e) {
    notify(
      e instanceof Error ? e.message : 'Failed to add to inventory',
      'error'
    )
  } finally {
    addingToInventory.value = false
  }
}

async function handleRemoveInventory(id: string) {
  try {
    await removeFromInventory(id)
    notify('Removed from inventory')
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Failed to remove', 'error')
  }
}

// ── Slot handlers ──────────────────────────────────────────────────────────
async function handleDrop(inventoryId: string, date: string, mealType: string) {
  if ((portionsRemaining.value[inventoryId] ?? 0) <= 0) {
    notify('No portions remaining for this meal', 'warning')
    return
  }
  try {
    await assignSlot(inventoryId, date, mealType)
    notify('Meal added to plan')
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Failed to assign meal', 'error')
  }
}

async function handleConfirm(slotId: string, confirmed: boolean) {
  try {
    await confirmSlot(slotId, confirmed)
    notify(confirmed ? 'Marked as eaten ✓' : 'Unmarked')
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Failed to update', 'error')
  }
}

async function handleRemoveSlot(slotId: string) {
  try {
    await removeSlot(slotId)
    notify('Removed from plan')
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Failed to remove', 'error')
  }
}

// ── Shopping List Generator ─────────────────────────────────────────────────
function generateShoppingList() {
  if (inventory.value.length === 0) return

  // Aggregate all inventory items with their template nutrition data
  const lines: string[] = [
    `Shopping List — Week of ${weekStart.value}`,
    `Generated on ${new Date().toLocaleDateString()}`,
    '',
    'Meal,Portions,Serving Size,Calories (each),Protein g,Carbs g,Fat g,Notes',
  ]

  for (const inv of inventory.value as MealInventory[]) {
    const tpl = inv.template
    if (!tpl) continue
    const row = [
      `"${tpl.name}"`,
      inv.quantity,
      `"${tpl.serving_size || '1 serving'}"`,
      tpl.calories,
      tpl.protein,
      tpl.carbs,
      tpl.fat,
      `"${tpl.notes || ''}"`,
    ].join(',')
    lines.push(row)
  }

  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `shopping-list-${weekStart.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
  notify('Shopping list downloaded')
}

// ── Init ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchTemplates(), fetchWeekData()])
})
</script>

<style scoped>
.planner-page {
  max-width: 1400px;
  margin: 0 auto;
}

.planner-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.planner-sidebar-card {
  width: 280px;
  flex-shrink: 0;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  position: sticky;
  top: 88px;
}

.planner-calendar-card {
  min-width: 0;
  flex: 1;
}

@media (max-width: 768px) {
  .planner-layout {
    flex-direction: column;
  }
  .planner-sidebar-card {
    width: 100%;
    max-height: none;
    position: static;
  }
}
</style>
