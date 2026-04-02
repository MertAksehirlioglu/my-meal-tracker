import { ref, computed } from 'vue'
import type { UserGoal, Meal } from '~/server/database/schemas'

/**
 * Fetches the active user goal and today's meals, then exposes
 * a `remainingCalories` computed so any page can show a budget banner.
 */
export const useGoals = () => {
  const goal = ref<UserGoal | null>(null)
  const todayMeals = ref<Meal[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const todayCalories = computed(() =>
    todayMeals.value.reduce((sum, m) => sum + (m.calories ?? 0), 0)
  )

  const remainingCalories = computed(() => {
    if (!goal.value?.target_calories) return null
    return goal.value.target_calories - todayCalories.value
  })

  const fetchGoalAndToday = async () => {
    loading.value = true
    error.value = null
    try {
      const { authenticatedFetch } = useAuthenticatedFetch()
      const [goalsRes, mealsRes] = await Promise.all([
        authenticatedFetch('/api/goals/active'),
        authenticatedFetch('/api/meals/today'),
      ])

      if (goalsRes.ok) {
        const { data } = (await goalsRes.json()) as {
          success: boolean
          data: UserGoal | null
        }
        goal.value = data
      }

      if (mealsRes.ok) {
        const { data } = (await mealsRes.json()) as {
          success: boolean
          data: Meal[]
        }
        todayMeals.value = data ?? []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load goals'
    } finally {
      loading.value = false
    }
  }

  return {
    goal,
    todayCalories,
    remainingCalories,
    loading,
    error,
    fetchGoalAndToday,
  }
}
