import type { FoodItem } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import {
  defineWrappedEventHandler,
  sendApiResponse,
} from '~/server/utils/api-error'

interface IngredientInput {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number | null
  sugar?: number | null
}

const VALID_UNITS = ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'serving']
const MAX_ITEMS = 50

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  blockDemoUserWrite(event)

  const mealId = getRouterParam(event, 'id')
  if (!mealId) {
    throw createError({ statusCode: 400, statusMessage: 'Meal ID is required' })
  }

  const body = await readBody(event)
  const { food_items } = body as { food_items: IngredientInput[] }

  if (!Array.isArray(food_items) || food_items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'food_items must be a non-empty array',
    })
  }

  if (food_items.length > MAX_ITEMS) {
    throw createError({
      statusCode: 400,
      statusMessage: `Cannot add more than ${MAX_ITEMS} food items at once`,
    })
  }

  const supabase = getSupabaseClient()

  // Fetch meal without user_id filter so we can return 403 vs 404
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select('id, user_id')
    .eq('id', mealId)
    .single()

  if (mealError || !meal) {
    throw createError({ statusCode: 404, statusMessage: 'Meal not found' })
  }

  if (meal.user_id !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: meal does not belong to you',
    })
  }

  for (const item of food_items) {
    if (
      !item.name ||
      typeof item.name !== 'string' ||
      item.name.trim().length === 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Each ingredient must have a non-empty name',
      })
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid quantity for "${item.name}"`,
      })
    }
    if (!item.unit || !VALID_UNITS.includes(item.unit)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid unit for "${item.name}". Allowed: ${VALID_UNITS.join(', ')}`,
      })
    }
    if (typeof item.calories !== 'number' || item.calories < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid calories for "${item.name}"`,
      })
    }
  }

  const rows = food_items.map((item) => ({
    meal_id: mealId,
    name: item.name.trim(),
    quantity: item.quantity,
    unit: item.unit,
    calories: Math.round(item.calories),
    protein: item.protein ?? 0,
    carbs: item.carbs ?? 0,
    fat: item.fat ?? 0,
    fiber: item.fiber ?? null,
    sugar: item.sugar ?? null,
  }))

  const { data, error } = await supabase
    .from('food_items')
    .insert(rows)
    .select()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save food items',
    })
  }

  return sendApiResponse(data as FoodItem[])
})
