// Demo data composable — thin wrapper over static templates
import { demoMealTemplates, demoProgressTemplates } from '@/data/demo-meals'

export function useDemoData() {
  const today = new Date()

  const formatDate = (daysOffset: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + daysOffset)
    return date.toISOString()
  }

  const formatTime = (daysOffset: number, hour: number, minute: number = 0) => {
    const date = new Date(today)
    date.setDate(date.getDate() + daysOffset)
    date.setHours(hour, minute, 0, 0)
    return date.toISOString()
  }

  const demoMeals = demoMealTemplates.map((t) => ({
    id: t.id,
    user_id: 'demo',
    name: t.name,
    meal_type: t.meal_type,
    consumed_at: formatTime(t.dayOffset, t.hour, t.minute),
    total_calories: t.total_calories,
    total_protein: t.total_protein,
    total_carbs: t.total_carbs,
    total_fat: t.total_fat,
    total_fiber: t.total_fiber,
    total_sugar: t.total_sugar,
    notes: t.notes,
    created_at: formatDate(t.dayOffset),
    updated_at: formatDate(t.dayOffset),
  }))

  const demoProgress = demoProgressTemplates.map((t) => ({
    id: t.id,
    user_id: 'demo',
    date: formatDate(t.dayOffset).split('T')[0],
    total_calories: t.total_calories,
    total_protein: t.total_protein,
    total_carbs: t.total_carbs,
    total_fat: t.total_fat,
    created_at: formatDate(t.dayOffset),
  }))

  const demoGoals = {
    id: '1',
    user_id: 'demo',
    target_calories: 2000,
    target_protein: 150,
    target_carbs: 250,
    target_fat: 65,
    start_date: formatDate(-30).split('T')[0],
    is_active: true,
    created_at: formatDate(-30),
    updated_at: formatDate(0),
  }

  const demoUser = {
    id: 'demo',
    email: useRuntimeConfig().public.demoEmail || 'demo@mealsnap.app',
    name: 'Demo User',
    height: 170,
    weight: 70,
    age: 30,
    activity_level: 'moderate',
    goal: 'maintain',
    daily_calorie_target: 2000,
    created_at: formatDate(-30),
    updated_at: formatDate(0),
  }

  const todayDate = formatDate(0).split('T')[0]

  return {
    demoMeals,
    demoProgress,
    demoGoals,
    demoUser,
    getTodaysMeals: () =>
      demoMeals.filter((meal) => meal.consumed_at.startsWith(todayDate)),
    getTodaysProgress: () =>
      demoProgress.find((progress) => progress.date === todayDate),
    getActiveGoals: () => demoGoals,
    getRecentMeals: (days: number = 7) => demoMeals.slice(0, days * 4),
    getProgressHistory: (days: number = 7) => demoProgress.slice(0, days),
  }
}
