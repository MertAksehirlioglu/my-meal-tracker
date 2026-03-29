import { ref } from 'vue'
import type { Meal } from '~/server/database/schemas'

export interface PendingMeal extends Meal {
  _pending: true
  _rollbackReason?: string
}

// Module-level so add-meal.vue and home/history pages share the same list
const pendingMeals = ref<PendingMeal[]>([])

export function usePendingMeals() {
  const addPending = (partial: Omit<Meal, 'id' | 'created_at' | 'updated_at'>): string => {
    const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const now = new Date().toISOString()
    pendingMeals.value.push({
      ...(partial as Meal),
      id: tempId,
      created_at: now,
      updated_at: now,
      _pending: true,
    })
    return tempId
  }

  const confirmPending = (tempId: string, saved: Meal) => {
    const idx = pendingMeals.value.findIndex((m) => m.id === tempId)
    if (idx !== -1) pendingMeals.value.splice(idx, 1)
    return saved
  }

  const rollbackPending = (tempId: string, reason?: string) => {
    const idx = pendingMeals.value.findIndex((m) => m.id === tempId)
    if (idx !== -1) {
      pendingMeals.value[idx]._rollbackReason = reason ?? 'Failed to save'
      // Remove after a short delay so UI can show the error state
      setTimeout(() => {
        pendingMeals.value = pendingMeals.value.filter((m) => m.id !== tempId)
      }, 3000)
    }
  }

  return { pendingMeals, addPending, confirmPending, rollbackPending }
}
