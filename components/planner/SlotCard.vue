<template>
  <v-card
    class="slot-card"
    :class="{ 'slot-card--confirmed': planSlot.is_confirmed }"
    variant="elevated"
    elevation="1"
    rounded="lg"
  >
    <v-card-text class="pa-2">
      <div class="d-flex align-center justify-space-between">
        <span class="text-caption font-weight-semibold text-truncate">
          {{ planSlot.inventory?.template?.name ?? 'Meal' }}
        </span>

        <div class="d-flex align-center gap-0 flex-shrink-0 ml-1">
          <!-- Confirm toggle -->
          <v-btn
            icon
            size="x-small"
            variant="text"
            :color="planSlot.is_confirmed ? 'success' : 'grey'"
            :title="
              planSlot.is_confirmed ? 'Mark as not eaten' : 'Mark as eaten'
            "
            @click.stop="$emit('confirm', planSlot.id, !planSlot.is_confirmed)"
          >
            <v-icon size="16">
              {{
                planSlot.is_confirmed
                  ? 'mdi-check-circle'
                  : 'mdi-check-circle-outline'
              }}
            </v-icon>
          </v-btn>

          <!-- Remove -->
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            title="Remove from plan"
            @click.stop="$emit('remove', planSlot.id)"
          >
            <v-icon size="14">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <div class="text-caption text-medium-emphasis">
        {{ planSlot.inventory?.template?.calories ?? 0 }} kcal
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { MealPlanSlot } from '~/server/database/schemas'

defineProps<{
  planSlot: MealPlanSlot
}>()

defineEmits<{
  confirm: [slotId: string, confirmed: boolean]
  remove: [slotId: string]
}>()
</script>

<style scoped>
.slot-card {
  transition: opacity 0.2s;
}
.slot-card--confirmed {
  opacity: 0.65;
}
.slot-card--confirmed .v-card-text {
  text-decoration: line-through;
  text-decoration-color: rgba(0, 0, 0, 0.35);
}
</style>
