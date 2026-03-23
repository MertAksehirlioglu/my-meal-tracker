<template>
  <v-card
    class="inventory-card"
    :class="{ 'inventory-card--depleted': remaining === 0 }"
    variant="tonal"
    color="primary"
    rounded="lg"
    draggable="true"
  >
    <v-card-text class="pa-3">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2 min-width-0">
          <v-tooltip
            text="Drag to a calendar slot to plan"
            location="top"
            :open-delay="400"
          >
            <template #activator="{ props: tipProps }">
              <span
                v-bind="tipProps"
                class="drag-handle flex-shrink-0"
                aria-label="Drag handle"
              >⠿</span>
            </template>
          </v-tooltip>
          <span class="text-body-2 font-weight-medium text-truncate">
            {{ inventory.template?.name ?? 'Meal' }}
          </span>
        </div>

        <div class="d-flex align-center gap-1 flex-shrink-0 ml-2">
          <v-chip
            size="x-small"
            :color="remaining === 0 ? 'grey' : 'primary'"
            variant="flat"
          >
            {{ remaining }}/{{ inventory.quantity }}
          </v-chip>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            @click.stop="$emit('remove', inventory.id)"
          >
            <v-icon size="14">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <div class="text-caption text-medium-emphasis mt-1">
        {{ inventory.template?.calories ?? 0 }} kcal · P
        {{ inventory.template?.protein ?? 0 }}g
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { MealInventory } from '~/server/database/schemas'

defineProps<{
  inventory: MealInventory
  remaining: number
}>()

defineEmits<{
  remove: [id: string]
}>()
</script>

<style scoped>
.inventory-card {
  cursor: grab;
  transition:
    opacity 0.2s,
    transform 0.15s,
    box-shadow 0.15s;
  user-select: none;
}
.inventory-card:active {
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
.inventory-card--depleted {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
.drag-handle {
  font-size: 14px;
  line-height: 1;
  color: rgba(0, 0, 0, 0.38);
  cursor: grab;
  padding: 2px 1px;
  border-radius: 3px;
  transition: color 0.15s;
}
.drag-handle:hover {
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.06);
}
</style>
