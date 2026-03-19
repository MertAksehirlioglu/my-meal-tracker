<template>
  <div class="inventory-list">
    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-4">
      <v-progress-circular indeterminate color="primary" size="24" />
    </div>

    <!-- Empty state -->
    <div v-else-if="inventory.length === 0" class="text-center py-6">
      <v-icon size="36" color="grey-lighten-1">mdi-fridge-outline</v-icon>
      <p class="text-body-2 text-medium-emphasis mt-2">
        No meals in stock this week.<br />Tap + to add from your templates.
      </p>
    </div>

    <!-- Draggable inventory items -->
    <div v-else class="d-flex flex-column">
      <div
        v-for="inv in inventory"
        :key="inv.id"
        class="inv-item"
        :draggable="portionsRemaining[inv.id] > 0"
        @dragstart="(e) => onDragStart(e, inv.id)"
        @dragend="onDragEnd"
      >
        <InventoryCard
          :inventory="inv"
          :remaining="portionsRemaining[inv.id] ?? 0"
          @remove="(id) => $emit('remove', id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealInventory } from '~/server/database/schemas'
import InventoryCard from './InventoryCard.vue'

defineProps<{
  inventory: MealInventory[]
  portionsRemaining: Record<string, number>
  loading: boolean
}>()

defineEmits<{
  remove: [id: string]
}>()

function onDragStart(event: DragEvent, inventoryId: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', inventoryId)
    event.dataTransfer.effectAllowed = 'copy'
  }
}

function onDragEnd(_event: DragEvent) {
  // No-op: visual cleanup handled by CSS :active
}
</script>

<style scoped>
.inv-item {
  margin-bottom: 12px;
}
.inv-item:last-child {
  margin-bottom: 0;
}
</style>
