<template>
  <div class="d-flex align-center gap-2">
    <v-btn icon size="small" variant="text" @click="$emit('prev')">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>

    <span class="text-body-2 font-weight-medium week-label">{{ label }}</span>

    <v-btn icon size="small" variant="text" @click="$emit('next')">
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>

    <v-btn
      v-if="!isCurrentWeek"
      size="small"
      variant="tonal"
      color="primary"
      class="ml-1"
      @click="$emit('today')"
    >
      Today
    </v-btn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  isCurrentWeek: boolean
}>()

defineEmits<{
  prev: []
  next: []
  today: []
}>()
</script>

<style scoped>
.week-label {
  min-width: 160px;
  text-align: center;
}
</style>
