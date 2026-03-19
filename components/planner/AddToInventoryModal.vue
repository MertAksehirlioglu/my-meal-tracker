<template>
  <v-dialog v-model="open" max-width="360" persistent>
    <v-card rounded="xl">
      <v-card-title class="pt-5 px-5 text-body-1 font-weight-bold">
        Add to This Week
      </v-card-title>

      <v-card-text class="px-5 pb-2">
        <p class="text-body-2 text-medium-emphasis mb-4">
          How many portions of <strong>{{ template?.name }}</strong> do you have
          this week?
        </p>

        <div class="d-flex align-center justify-center gap-4">
          <v-btn
            icon
            variant="tonal"
            size="small"
            :disabled="qty <= 1"
            @click="qty = Math.max(1, qty - 1)"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>

          <span class="text-h5 font-weight-bold quantity-display">{{
            qty
          }}</span>

          <v-btn
            icon
            variant="tonal"
            size="small"
            :disabled="qty >= 20"
            @click="qty = Math.min(20, qty + 1)"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>

        <p class="text-caption text-center text-disabled mt-2">portions</p>
      </v-card-text>

      <v-card-actions class="px-5 pb-5 gap-2">
        <v-spacer />
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          @click="confirm"
        >
          Add {{ qty }} portion{{ qty !== 1 ? 's' : '' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MealTemplate } from '~/server/database/schemas'

const props = defineProps<{
  modelValue: boolean
  template: MealTemplate | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [quantity: number]
}>()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const qty = ref(1)

watch(
  () => props.modelValue,
  (v) => {
    if (v) qty.value = 1
  }
)

function confirm() {
  emit('confirm', qty.value)
}

function cancel() {
  open.value = false
}
</script>

<style scoped>
.quantity-display {
  min-width: 40px;
  text-align: center;
}
</style>
