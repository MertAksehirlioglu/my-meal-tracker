import type {
  Meal,
  UserGoal,
  UserProgress,
  FoodItem,
  User,
  MealTemplate,
  MealInventory,
  MealPlanSlot,
} from '~/server/database/schemas'
import type { DailyTotal } from './date-helpers'
import { demoPlannerTemplateData } from '@/data/demo-meals'

async function getDemoData() {
  const { useDemoData } = await import('~/composables/useDemoData')
  return useDemoData()
}

export async function getDemoMealsForToday(userId: string): Promise<Meal[]> {
  const { getTodaysMeals } = await getDemoData()
  return getTodaysMeals().map((meal) => ({
    ...meal,
    user_id: userId,
  })) as Meal[]
}

export async function getDemoMealsByDate(
  userId: string,
  targetDate: Date
): Promise<Meal[]> {
  const { demoMeals } = await getDemoData()
  const dateStr = targetDate.toISOString().split('T')[0]
  return demoMeals
    .filter((meal) => meal.consumed_at.split('T')[0] === dateStr)
    .map((meal) => ({ ...meal, user_id: userId })) as Meal[]
}

export async function getDemoActiveGoals(userId: string): Promise<UserGoal> {
  const { demoGoals } = await getDemoData()
  return { ...demoGoals, user_id: userId } as UserGoal
}

export async function getDemoUserProfile(
  userId: string,
  email?: string
): Promise<User> {
  const { demoUser } = await getDemoData()
  return {
    ...demoUser,
    id: userId,
    email: email || demoUser.email,
  } as User
}

export async function getDemoTodayProgress(
  userId: string
): Promise<UserProgress> {
  const { getTodaysProgress } = await getDemoData()
  const progress = getTodaysProgress()

  if (progress) {
    return { ...progress, user_id: userId }
  }

  const today = new Date()
  return {
    id: `demo_progress_${today.getDate()}`,
    user_id: userId,
    date: today.toISOString().split('T')[0],
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    created_at: today.toISOString(),
  }
}

export async function getDemoWeeklyProgress(): Promise<DailyTotal[]> {
  const { demoMeals } = await getDemoData()
  const today = new Date()
  const dailyMap = new Map<string, DailyTotal>()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dailyMap.set(key, {
      date: key,
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      meal_count: 0,
    })
  }

  for (const meal of demoMeals) {
    const key = meal.consumed_at.split('T')[0]
    const existing = dailyMap.get(key)
    if (existing) {
      existing.total_calories += meal.total_calories ?? 0
      existing.total_protein += meal.total_protein ?? 0
      existing.total_carbs += meal.total_carbs ?? 0
      existing.total_fat += meal.total_fat ?? 0
      existing.meal_count += 1
    }
  }

  return Array.from(dailyMap.values())
}

export async function getDemoSampleMealsAndGoals() {
  const { getTodaysMeals, demoGoals } = await getDemoData()
  const meals = getTodaysMeals()
  return { meals, goals: demoGoals }
}

const DEMO_FOOD_ITEMS: Record<string, FoodItem[]> = {
  '1': [
    {
      id: 'fi-1a',
      meal_id: '1',
      name: 'Greek Yogurt',
      quantity: 200,
      unit: 'g',
      calories: 130,
      protein: 12,
      carbs: 9,
      fat: 4,
      fiber: 0,
      sugar: 8,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fi-1b',
      meal_id: '1',
      name: 'Mixed Berries',
      quantity: 80,
      unit: 'g',
      calories: 45,
      protein: 1,
      carbs: 11,
      fat: 0,
      fiber: 3,
      sugar: 7,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fi-1c',
      meal_id: '1',
      name: 'Honey',
      quantity: 10,
      unit: 'g',
      calories: 30,
      protein: 0,
      carbs: 8,
      fat: 0,
      fiber: 0,
      sugar: 8,
      created_at: new Date().toISOString(),
    },
  ],
  '2': [
    {
      id: 'fi-2a',
      meal_id: '2',
      name: 'Grilled Chicken Breast',
      quantity: 150,
      unit: 'g',
      calories: 248,
      protein: 47,
      carbs: 0,
      fat: 5,
      fiber: 0,
      sugar: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fi-2b',
      meal_id: '2',
      name: 'Romaine Lettuce',
      quantity: 80,
      unit: 'g',
      calories: 14,
      protein: 1,
      carbs: 2,
      fat: 0,
      fiber: 2,
      sugar: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fi-2c',
      meal_id: '2',
      name: 'Caesar Dressing',
      quantity: 30,
      unit: 'g',
      calories: 120,
      protein: 1,
      carbs: 1,
      fat: 13,
      fiber: 0,
      sugar: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fi-2d',
      meal_id: '2',
      name: 'Parmesan Cheese',
      quantity: 20,
      unit: 'g',
      calories: 80,
      protein: 7,
      carbs: 0,
      fat: 5,
      fiber: 0,
      sugar: 0,
      created_at: new Date().toISOString(),
    },
  ],
  '3': [
    {
      id: 'fi-3a',
      meal_id: '3',
      name: 'Apple',
      quantity: 182,
      unit: 'g',
      calories: 95,
      protein: 0,
      carbs: 25,
      fat: 0,
      fiber: 4,
      sugar: 19,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fi-3b',
      meal_id: '3',
      name: 'Almond Butter',
      quantity: 16,
      unit: 'g',
      calories: 98,
      protein: 3,
      carbs: 3,
      fat: 9,
      fiber: 1,
      sugar: 1,
      created_at: new Date().toISOString(),
    },
  ],
  '4': [
    {
      id: 'fi-4a',
      meal_id: '4',
      name: 'Salmon Fillet',
      quantity: 170,
      unit: 'g',
      calories: 350,
      protein: 34,
      carbs: 0,
      fat: 22,
      fiber: 0,
      sugar: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fi-4b',
      meal_id: '4',
      name: 'Quinoa',
      quantity: 185,
      unit: 'g',
      calories: 220,
      protein: 8,
      carbs: 40,
      fat: 4,
      fiber: 5,
      sugar: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fi-4c',
      meal_id: '4',
      name: 'Steamed Broccoli',
      quantity: 80,
      unit: 'g',
      calories: 27,
      protein: 2,
      carbs: 5,
      fat: 0,
      fiber: 2,
      sugar: 1,
      created_at: new Date().toISOString(),
    },
  ],
}

export function getDemoFoodItems(mealId: string): FoodItem[] {
  return DEMO_FOOD_ITEMS[mealId] ?? []
}

// ── Planner demo data ──────────────────────────────────────────────────────

function plannerAddDays(base: string, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]!
}

export function getDemoPlannerTemplates(userId: string): MealTemplate[] {
  const now = new Date().toISOString()
  return demoPlannerTemplateData.map((t) => ({
    id: t.id,
    user_id: userId,
    name: t.name,
    calories: t.calories,
    protein: t.protein,
    carbs: t.carbs,
    fat: t.fat,
    fiber: t.fiber,
    sugar: 0,
    serving_size: t.serving_size,
    notes: t.notes,
    created_at: now,
    updated_at: now,
  }))
}

export function getDemoPlannerInventory(
  userId: string,
  weekStart: string
): MealInventory[] {
  const now = new Date().toISOString()
  const templates = getDemoPlannerTemplates(userId)
  const [tpl1, tpl2, tpl3, tpl4, tpl5] = templates as [
    MealTemplate,
    MealTemplate,
    MealTemplate,
    MealTemplate,
    MealTemplate,
  ]
  return [
    {
      id: 'dpi-1',
      user_id: userId,
      template_id: tpl1.id,
      week_start: weekStart,
      quantity: 4,
      portions_used: 3,
      created_at: now,
      updated_at: now,
      template: tpl1,
    },
    {
      id: 'dpi-2',
      user_id: userId,
      template_id: tpl2.id,
      week_start: weekStart,
      quantity: 5,
      portions_used: 2,
      created_at: now,
      updated_at: now,
      template: tpl2,
    },
    {
      id: 'dpi-3',
      user_id: userId,
      template_id: tpl3.id,
      week_start: weekStart,
      quantity: 3,
      portions_used: 2,
      created_at: now,
      updated_at: now,
      template: tpl3,
    },
    {
      id: 'dpi-4',
      user_id: userId,
      template_id: tpl4.id,
      week_start: weekStart,
      quantity: 2,
      portions_used: 1,
      created_at: now,
      updated_at: now,
      template: tpl4,
    },
    {
      id: 'dpi-5',
      user_id: userId,
      template_id: tpl5.id,
      week_start: weekStart,
      quantity: 4,
      portions_used: 1,
      created_at: now,
      updated_at: now,
      template: tpl5,
    },
  ]
}

export function getDemoPlannerSlots(
  userId: string,
  weekStart: string
): MealPlanSlot[] {
  const now = new Date().toISOString()
  const inventory = getDemoPlannerInventory(userId, weekStart)
  const [inv1, inv2, inv3, inv4, inv5] = inventory as [
    MealInventory,
    MealInventory,
    MealInventory,
    MealInventory,
    MealInventory,
  ]
  return [
    // Monday — confirmed
    {
      id: 'dps-1',
      user_id: userId,
      inventory_id: inv2.id,
      planned_date: plannerAddDays(weekStart, 0),
      meal_type: 'breakfast',
      is_confirmed: true,
      confirmed_at: now,
      created_at: now,
      updated_at: now,
      inventory: inv2,
    },
    {
      id: 'dps-2',
      user_id: userId,
      inventory_id: inv1.id,
      planned_date: plannerAddDays(weekStart, 0),
      meal_type: 'lunch',
      is_confirmed: true,
      confirmed_at: now,
      created_at: now,
      updated_at: now,
      inventory: inv1,
    },
    // Tuesday — confirmed
    {
      id: 'dps-3',
      user_id: userId,
      inventory_id: inv3.id,
      planned_date: plannerAddDays(weekStart, 1),
      meal_type: 'breakfast',
      is_confirmed: true,
      confirmed_at: now,
      created_at: now,
      updated_at: now,
      inventory: inv3,
    },
    {
      id: 'dps-4',
      user_id: userId,
      inventory_id: inv4.id,
      planned_date: plannerAddDays(weekStart, 1),
      meal_type: 'dinner',
      is_confirmed: true,
      confirmed_at: now,
      created_at: now,
      updated_at: now,
      inventory: inv4,
    },
    // Wednesday — confirmed
    {
      id: 'dps-5',
      user_id: userId,
      inventory_id: inv5.id,
      planned_date: plannerAddDays(weekStart, 2),
      meal_type: 'breakfast',
      is_confirmed: true,
      confirmed_at: now,
      created_at: now,
      updated_at: now,
      inventory: inv5,
    },
    {
      id: 'dps-6',
      user_id: userId,
      inventory_id: inv1.id,
      planned_date: plannerAddDays(weekStart, 2),
      meal_type: 'lunch',
      is_confirmed: true,
      confirmed_at: now,
      created_at: now,
      updated_at: now,
      inventory: inv1,
    },
    // Thursday — unconfirmed
    {
      id: 'dps-7',
      user_id: userId,
      inventory_id: inv2.id,
      planned_date: plannerAddDays(weekStart, 3),
      meal_type: 'breakfast',
      is_confirmed: false,
      created_at: now,
      updated_at: now,
      inventory: inv2,
    },
    {
      id: 'dps-8',
      user_id: userId,
      inventory_id: inv1.id,
      planned_date: plannerAddDays(weekStart, 3),
      meal_type: 'lunch',
      is_confirmed: false,
      created_at: now,
      updated_at: now,
      inventory: inv1,
    },
    // Friday — unconfirmed
    {
      id: 'dps-9',
      user_id: userId,
      inventory_id: inv3.id,
      planned_date: plannerAddDays(weekStart, 4),
      meal_type: 'breakfast',
      is_confirmed: false,
      created_at: now,
      updated_at: now,
      inventory: inv3,
    },
  ]
}
