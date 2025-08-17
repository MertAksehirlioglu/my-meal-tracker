// Database schemas and types for Supabase
// These types match your Supabase table structures

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  name?: string
  avatar_url?: string
  height?: number
  weight?: number
  age?: number
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal?: 'lose' | 'maintain' | 'gain'
  daily_calorie_target?: number
}

export interface Meal {
  id: string
  user_id: string
  name: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  consumed_at: string
  created_at: string
  updated_at: string
  image_url?: string
  notes?: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  total_fiber?: number
  total_sugar?: number
}

export interface FoodItem {
  id: string
  meal_id: string
  name: string
  quantity: number
  unit: string // 'g', 'oz', 'cup', 'piece', etc.
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  confidence?: number // from AI classification
  created_at: string
}

export interface FoodDatabase {
  id: string
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g?: number
  sugar_per_100g?: number
  category?: string
  created_at: string
  updated_at: string
}

export interface UserGoal {
  id: string
  user_id: string
  target_weight?: number
  target_calories?: number
  target_protein?: number
  target_carbs?: number
  target_fat?: number
  start_date: string
  end_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  date: string
  weight?: number
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  created_at: string
}

// Database table names
export const TABLES = {
  USERS: 'users',
  MEALS: 'meals',
  FOOD_ITEMS: 'food_items',
  FOOD_DATABASE: 'food_database',
  USER_GOALS: 'user_goals',
  USER_PROGRESS: 'user_progress',
} as const

// Row Level Security (RLS) policies
export const RLS_POLICIES = {
  // Users can only access their own data
  USERS_OWN_DATA: 'users_own_data',
  MEALS_OWN_DATA: 'meals_own_data',
  FOOD_ITEMS_OWN_DATA: 'food_items_own_data',
  USER_GOALS_OWN_DATA: 'user_goals_own_data',
  USER_PROGRESS_OWN_DATA: 'user_progress_own_data',
  // Food database is public for all users
  FOOD_DATABASE_PUBLIC: 'food_database_public',
} as const

// Helper types for API responses
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  count?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Type for creating new records (omitting auto-generated fields)
export type CreateUser = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type CreateMeal = Omit<Meal, 'id' | 'created_at' | 'updated_at'>
export type CreateFoodItem = Omit<FoodItem, 'id' | 'created_at'>
export type CreateFoodDatabase = Omit<
  FoodDatabase,
  'id' | 'created_at' | 'updated_at'
>
export type CreateUserGoal = Omit<UserGoal, 'id' | 'created_at' | 'updated_at'>
export type CreateUserProgress = Omit<UserProgress, 'id' | 'created_at'>

// Type for updating records (making all fields optional except id)
export type UpdateUser = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
export type UpdateMeal = Partial<Omit<Meal, 'id' | 'created_at' | 'updated_at'>>
export type UpdateFoodItem = Partial<Omit<FoodItem, 'id' | 'created_at'>>
export type UpdateFoodDatabase = Partial<
  Omit<FoodDatabase, 'id' | 'created_at' | 'updated_at'>
>
export type UpdateUserGoal = Partial<
  Omit<UserGoal, 'id' | 'created_at' | 'updated_at'>
>
export type UpdateUserProgress = Partial<
  Omit<UserProgress, 'id' | 'created_at'>
>
