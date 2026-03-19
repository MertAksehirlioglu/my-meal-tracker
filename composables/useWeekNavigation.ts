import { ref, computed } from 'vue'
import {
  currentWeekStart,
  shiftDate,
  formatWeekRange,
  isCurrentWeek,
} from '~/lib/week-utils'

export function useWeekNavigation() {
  const weekStart = ref<string>(currentWeekStart())

  const weekLabel = computed(() => formatWeekRange(weekStart.value))
  const isThisWeek = computed(() => isCurrentWeek(weekStart.value))

  function goToPrevWeek() {
    weekStart.value = shiftDate(weekStart.value, -7)
  }

  function goToNextWeek() {
    weekStart.value = shiftDate(weekStart.value, 7)
  }

  function goToCurrentWeek() {
    weekStart.value = currentWeekStart()
  }

  return {
    weekStart,
    weekLabel,
    isThisWeek,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  }
}
