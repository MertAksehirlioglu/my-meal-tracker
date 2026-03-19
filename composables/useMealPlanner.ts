import { ref, computed, watch } from 'vue'
import type {
  MealTemplate,
  MealInventory,
  MealPlanSlot,
} from '~/server/database/schemas'

export function useMealPlanner(
  weekStart: Readonly<ReturnType<typeof ref<string>>>
) {
  const { authenticatedFetch } = useAuthenticatedFetch()

  // ── State ──────────────────────────────────────────────────────────────────
  const templates = ref<MealTemplate[]>([])
  const inventory = ref<MealInventory[]>([])
  const slots = ref<MealPlanSlot[]>([])

  const loadingTemplates = ref(false)
  const loadingInventory = ref(false)
  const loadingSlots = ref(false)
  const error = ref<string | null>(null)

  // ── Derived ────────────────────────────────────────────────────────────────

  /** Map of inventory_id → portions remaining (quantity − used slots) */
  const portionsRemaining = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const inv of inventory.value) {
      const used = slots.value.filter((s) => s.inventory_id === inv.id).length
      map[inv.id] = Math.max(0, inv.quantity - used)
    }
    return map
  })

  /** Slots indexed by "YYYY-MM-DD|meal_type" for O(1) calendar lookups */
  const slotsByKey = computed<Record<string, MealPlanSlot[]>>(() => {
    const map: Record<string, MealPlanSlot[]> = {}
    for (const slot of slots.value) {
      const key = `${slot.planned_date}|${slot.meal_type}`
      if (!map[key]) map[key] = []
      map[key].push(slot)
    }
    return map
  })

  // ── Fetchers ───────────────────────────────────────────────────────────────

  async function fetchTemplates(search = '') {
    loadingTemplates.value = true
    error.value = null
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ''
      const res = await authenticatedFetch(`/api/planner/templates${qs}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message ?? 'Failed to load templates')
      templates.value = json.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load templates'
    } finally {
      loadingTemplates.value = false
    }
  }

  async function fetchInventory() {
    loadingInventory.value = true
    error.value = null
    try {
      const res = await authenticatedFetch(
        `/api/planner/inventory?week_start=${weekStart.value}`
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.message ?? 'Failed to load inventory')
      inventory.value = json.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load inventory'
    } finally {
      loadingInventory.value = false
    }
  }

  async function fetchSlots() {
    loadingSlots.value = true
    error.value = null
    try {
      const res = await authenticatedFetch(
        `/api/planner/slots?week_start=${weekStart.value}`
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.message ?? 'Failed to load slots')
      slots.value = json.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load slots'
    } finally {
      loadingSlots.value = false
    }
  }

  async function fetchWeekData() {
    await Promise.all([fetchInventory(), fetchSlots()])
  }

  // ── Template mutations ─────────────────────────────────────────────────────

  async function createTemplate(
    payload: Omit<MealTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) {
    const res = await authenticatedFetch('/api/planner/templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to create template')
    templates.value = [...templates.value, json.data]
    return json.data as MealTemplate
  }

  async function updateTemplate(id: string, payload: Partial<MealTemplate>) {
    const res = await authenticatedFetch(`/api/planner/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to update template')
    templates.value = templates.value.map((t) => (t.id === id ? json.data : t))
    return json.data as MealTemplate
  }

  async function deleteTemplate(id: string) {
    const res = await authenticatedFetch(`/api/planner/templates/${id}`, {
      method: 'DELETE',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to delete template')
    templates.value = templates.value.filter((t) => t.id !== id)
    inventory.value = inventory.value.filter((inv) => inv.template_id !== id)
    slots.value = slots.value.filter((s) => s.inventory?.template_id !== id)
  }

  // ── Inventory mutations ────────────────────────────────────────────────────

  async function addToInventory(templateId: string, quantity: number) {
    const res = await authenticatedFetch('/api/planner/inventory', {
      method: 'POST',
      body: JSON.stringify({
        template_id: templateId,
        week_start: weekStart.value,
        quantity,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to add to inventory')

    const existing = inventory.value.find((i) => i.id === json.data.id)
    if (existing) {
      inventory.value = inventory.value.map((i) =>
        i.id === json.data.id ? json.data : i
      )
    } else {
      inventory.value = [...inventory.value, json.data]
    }
    return json.data as MealInventory
  }

  async function updateInventoryQuantity(id: string, quantity: number) {
    const res = await authenticatedFetch(`/api/planner/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to update inventory')
    inventory.value = inventory.value.map((i) => (i.id === id ? json.data : i))
    return json.data as MealInventory
  }

  async function removeFromInventory(id: string) {
    const res = await authenticatedFetch(`/api/planner/inventory/${id}`, {
      method: 'DELETE',
    })
    const json = await res.json()
    if (!res.ok)
      throw new Error(json.message ?? 'Failed to remove inventory entry')
    inventory.value = inventory.value.filter((i) => i.id !== id)
    slots.value = slots.value.filter((s) => s.inventory_id !== id)
  }

  // ── Slot mutations ─────────────────────────────────────────────────────────

  async function assignSlot(
    inventoryId: string,
    plannedDate: string,
    mealType: string
  ) {
    const res = await authenticatedFetch('/api/planner/slots', {
      method: 'POST',
      body: JSON.stringify({
        inventory_id: inventoryId,
        planned_date: plannedDate,
        meal_type: mealType,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to assign slot')
    slots.value = [...slots.value, json.data]
    return json.data as MealPlanSlot
  }

  async function moveSlot(
    slotId: string,
    plannedDate: string,
    mealType: string
  ) {
    const res = await authenticatedFetch(`/api/planner/slots/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify({ planned_date: plannedDate, meal_type: mealType }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to move slot')
    slots.value = slots.value.map((s) => (s.id === slotId ? json.data : s))
    return json.data as MealPlanSlot
  }

  async function confirmSlot(slotId: string, confirmed: boolean) {
    const res = await authenticatedFetch(`/api/planner/slots/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_confirmed: confirmed }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to confirm slot')
    slots.value = slots.value.map((s) => (s.id === slotId ? json.data : s))
    return json.data as MealPlanSlot
  }

  async function removeSlot(slotId: string) {
    const res = await authenticatedFetch(`/api/planner/slots/${slotId}`, {
      method: 'DELETE',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to remove slot')
    slots.value = slots.value.filter((s) => s.id !== slotId)
  }

  // ── Reload on week change ──────────────────────────────────────────────────

  watch(weekStart, () => {
    fetchWeekData()
  })

  return {
    // State
    templates,
    inventory,
    slots,
    loadingTemplates,
    loadingInventory,
    loadingSlots,
    error,
    // Derived
    portionsRemaining,
    slotsByKey,
    // Fetchers
    fetchTemplates,
    fetchInventory,
    fetchSlots,
    fetchWeekData,
    // Template ops
    createTemplate,
    updateTemplate,
    deleteTemplate,
    // Inventory ops
    addToInventory,
    updateInventoryQuantity,
    removeFromInventory,
    // Slot ops
    assignSlot,
    moveSlot,
    confirmSlot,
    removeSlot,
  }
}
