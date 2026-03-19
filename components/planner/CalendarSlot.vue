<template>
  <div
    ref="slotRef"
    class="calendar-slot"
    :class="{
      'calendar-slot--dragover': isDragOver,
      'calendar-slot--has-items': slots.length > 0,
    }"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @drop.prevent="handleDrop"
  >
    <!-- Collapsed view -->
    <template v-if="!isExpanded">
      <div class="slot-label">{{ mealTypeLabel }}</div>

      <div class="slot-content">
        <!-- Empty -->
        <div
          v-if="slots.length === 0"
          class="empty-hint text-caption text-disabled"
        >
          <v-icon size="13">mdi-plus</v-icon>
          drop here
        </div>

        <!-- Single item — show card directly, no expand needed -->
        <SlotCard
          v-else-if="slots.length === 1"
          :plan-slot="slots[0]"
          @confirm="(id, c) => $emit('confirm', id, c)"
          @remove="(id) => $emit('remove', id)"
        />

        <!-- Multiple items — collapsed summary, click to expand -->
        <div v-else class="slot-summary" @click.stop="isExpanded = true">
          <span class="text-caption font-weight-semibold">
            {{ slots.length }} meals
          </span>
          <div class="d-flex align-center gap-1">
            <span class="text-caption text-medium-emphasis">
              {{ confirmedCount }}/{{ slots.length }}
              <v-icon size="11" color="success" class="ml-n1">mdi-check</v-icon>
            </span>
            <v-icon size="14" color="grey">mdi-chevron-down</v-icon>
          </div>
        </div>
      </div>
    </template>

    <!-- Expanded overlay (absolute, floats over adjacent slots) -->
    <div v-else class="slot-expanded-panel">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="slot-label" style="margin-bottom: 0">
          {{ mealTypeLabel }}
        </span>
        <v-btn
          icon
          size="x-small"
          variant="text"
          color="grey"
          @click.stop="isExpanded = false"
        >
          <v-icon size="14">mdi-chevron-up</v-icon>
        </v-btn>
      </div>

      <div class="slot-expanded-list">
        <SlotCard
          v-for="planSlot in slots"
          :key="planSlot.id"
          :plan-slot="planSlot"
          class="mb-1"
          @confirm="(id, c) => $emit('confirm', id, c)"
          @remove="(id) => $emit('remove', id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { MealPlanSlot } from '~/server/database/schemas'
import SlotCard from './SlotCard.vue'

const props = defineProps<{
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  slots: MealPlanSlot[]
}>()

const emit = defineEmits<{
  drop: [inventoryId: string, date: string, mealType: string]
  confirm: [slotId: string, confirmed: boolean]
  remove: [slotId: string]
}>()

const isDragOver = ref(false)
const isExpanded = ref(false)
const slotRef = ref<HTMLElement | null>(null)

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

const mealTypeLabel = computed(
  () => MEAL_LABELS[props.mealType] ?? props.mealType
)

const confirmedCount = computed(
  () => props.slots.filter((s) => s.is_confirmed).length
)

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const inventoryId = event.dataTransfer?.getData('text/plain')
  if (inventoryId) {
    emit('drop', inventoryId, props.date, props.mealType)
  }
}

function handleWindowClick(e: MouseEvent) {
  if (
    isExpanded.value &&
    slotRef.value &&
    !slotRef.value.contains(e.target as Node)
  ) {
    isExpanded.value = false
  }
}

onMounted(() => window.addEventListener('click', handleWindowClick))
onUnmounted(() => window.removeEventListener('click', handleWindowClick))
</script>

<style scoped>
.calendar-slot {
  height: 96px;
  display: flex;
  flex-direction: column;
  padding: 6px;
  border: 1.5px dashed rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  position: relative;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.calendar-slot--dragover {
  background: rgba(26, 46, 28, 0.06);
  border-color: #1a2e1c;
}

.calendar-slot--has-items {
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.08);
}

.slot-label {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
}

.slot-content {
  flex: 1;
  min-height: 0;
}

.empty-hint {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.slot-summary {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.slot-summary:hover {
  background: rgba(0, 0, 0, 0.04);
}

.slot-expanded-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 6px;
  border-radius: 8px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.14);
  z-index: 20;
}

.slot-expanded-list {
  max-height: 200px;
  overflow-y: auto;
}
</style>
