import { createClient } from '@supabase/supabase-js'
import type { FoodItem } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'

const DEMO_FOOD_ITEMS: Record<string, FoodItem[]> = {
  '1': [
    { id: 'fi-1a', meal_id: '1', name: 'Greek Yogurt', quantity: 200, unit: 'g', calories: 130, protein: 12, carbs: 9, fat: 4, fiber: 0, sugar: 8, created_at: new Date().toISOString() },
    { id: 'fi-1b', meal_id: '1', name: 'Mixed Berries', quantity: 80, unit: 'g', calories: 45, protein: 1, carbs: 11, fat: 0, fiber: 3, sugar: 7, created_at: new Date().toISOString() },
    { id: 'fi-1c', meal_id: '1', name: 'Honey', quantity: 10, unit: 'g', calories: 30, protein: 0, carbs: 8, fat: 0, fiber: 0, sugar: 8, created_at: new Date().toISOString() },
  ],
  '2': [
    { id: 'fi-2a', meal_id: '2', name: 'Grilled Chicken Breast', quantity: 150, unit: 'g', calories: 248, protein: 47, carbs: 0, fat: 5, fiber: 0, sugar: 0, created_at: new Date().toISOString() },
    { id: 'fi-2b', meal_id: '2', name: 'Romaine Lettuce', quantity: 80, unit: 'g', calories: 14, protein: 1, carbs: 2, fat: 0, fiber: 2, sugar: 1, created_at: new Date().toISOString() },
    { id: 'fi-2c', meal_id: '2', name: 'Caesar Dressing', quantity: 30, unit: 'g', calories: 120, protein: 1, carbs: 1, fat: 13, fiber: 0, sugar: 1, created_at: new Date().toISOString() },
    { id: 'fi-2d', meal_id: '2', name: 'Parmesan Cheese', quantity: 20, unit: 'g', calories: 80, protein: 7, carbs: 0, fat: 5, fiber: 0, sugar: 0, created_at: new Date().toISOString() },
  ],
  '3': [
    { id: 'fi-3a', meal_id: '3', name: 'Apple', quantity: 182, unit: 'g', calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, sugar: 19, created_at: new Date().toISOString() },
    { id: 'fi-3b', meal_id: '3', name: 'Almond Butter', quantity: 16, unit: 'g', calories: 98, protein: 3, carbs: 3, fat: 9, fiber: 1, sugar: 1, created_at: new Date().toISOString() },
  ],
  '4': [
    { id: 'fi-4a', meal_id: '4', name: 'Salmon Fillet', quantity: 170, unit: 'g', calories: 350, protein: 34, carbs: 0, fat: 22, fiber: 0, sugar: 0, created_at: new Date().toISOString() },
    { id: 'fi-4b', meal_id: '4', name: 'Quinoa', quantity: 185, unit: 'g', calories: 220, protein: 8, carbs: 40, fat: 4, fiber: 5, sugar: 2, created_at: new Date().toISOString() },
    { id: 'fi-4c', meal_id: '4', name: 'Steamed Broccoli', quantity: 80, unit: 'g', calories: 27, protein: 2, carbs: 5, fat: 0, fiber: 2, sugar: 1, created_at: new Date().toISOString() },
  ],
}

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const mealId = getRouterParam(event, 'id')

    if (!mealId) {
      throw createError({ statusCode: 400, statusMessage: 'Meal ID is required' })
    }

    if (isDemoUser(user)) {
      const items = DEMO_FOOD_ITEMS[mealId] ?? []
      return { success: true, data: items }
    }

    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .select('id')
      .eq('id', mealId)
      .eq('user_id', user.id)
      .single()

    if (mealError || !meal) {
      throw createError({ statusCode: 404, statusMessage: 'Meal not found' })
    }

    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('meal_id', mealId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Database error fetching food items:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch food items' })
    }

    return { success: true, data: data as FoodItem[] }
  } catch (error: unknown) {
    if ((error as { statusCode?: number })?.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
