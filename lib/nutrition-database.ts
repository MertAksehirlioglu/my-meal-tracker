import type { NutritionInfo } from '~/composables/useFoodAnalysis'

// Mock nutrition database - in production, this would be a real database
export const nutritionDatabase: Record<string, NutritionInfo> = {
  // Main dishes
  pizza: { calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2 },
  hamburger: { calories: 540, protein: 25, carbs: 40, fat: 31, fiber: 3 },
  sandwich: { calories: 300, protein: 15, carbs: 35, fat: 12, fiber: 4 },
  pasta: { calories: 220, protein: 8, carbs: 44, fat: 1, fiber: 3 },
  spaghetti: { calories: 220, protein: 8, carbs: 44, fat: 1, fiber: 3 },
  burrito: { calories: 326, protein: 15, carbs: 40, fat: 12, fiber: 6 },
  taco: { calories: 226, protein: 13, carbs: 18, fat: 13, fiber: 3 },

  // Proteins
  chicken: { calories: 239, protein: 27, carbs: 0, fat: 14, fiber: 0 },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
  fish: { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0 },
  salmon: { calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0 },
  eggs: { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0 },
  tofu: { calories: 94, protein: 10, carbs: 3, fat: 6, fiber: 1 },

  // Carbs/Grains
  rice: { calories: 205, protein: 4, carbs: 45, fat: 0, fiber: 1 },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3, fiber: 3 },
  quinoa: { calories: 222, protein: 8, carbs: 39, fat: 4, fiber: 5 },
  noodles: { calories: 220, protein: 8, carbs: 44, fat: 1, fiber: 3 },

  // Vegetables
  salad: { calories: 152, protein: 3, carbs: 7, fat: 14, fiber: 3 },
  broccoli: { calories: 34, protein: 3, carbs: 7, fat: 0, fiber: 3 },
  carrots: { calories: 41, protein: 1, carbs: 10, fat: 0, fiber: 3 },
  spinach: { calories: 23, protein: 3, carbs: 4, fat: 0, fiber: 2 },
  tomato: { calories: 18, protein: 1, carbs: 4, fat: 0, fiber: 1 },

  // Fruits
  apple: { calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4 },
  banana: { calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3 },
  orange: { calories: 47, protein: 1, carbs: 12, fat: 0, fiber: 2 },
  strawberry: { calories: 49, protein: 1, carbs: 12, fat: 0, fiber: 3 },

  // Snacks/Desserts
  cookie: { calories: 142, protein: 2, carbs: 20, fat: 7, fiber: 1 },
  cake: { calories: 257, protein: 3, carbs: 42, fat: 10, fiber: 1 },
  'ice cream': { calories: 207, protein: 4, carbs: 24, fat: 11, fiber: 1 },
  chips: { calories: 152, protein: 2, carbs: 15, fat: 10, fiber: 1 },

  // Beverages/Soups
  soup: { calories: 56, protein: 3, carbs: 8, fat: 2, fiber: 1 },
  smoothie: { calories: 145, protein: 4, carbs: 34, fat: 1, fiber: 4 },

  // Mixed meals
  'mixed meal': { calories: 350, protein: 18, carbs: 40, fat: 15, fiber: 5 },
  beverage: { calories: 80, protein: 0, carbs: 20, fat: 0, fiber: 0 },
}

// Enhanced food mapping from general image classification to food items
export const mapToFoodItem = (label: string): string => {
  const normalizedLabel = label.toLowerCase()

  // Map common objects/scenes to likely food items
  const foodMappings: Record<string, string> = {
    // Direct food matches
    pizza: 'pizza',
    hamburger: 'hamburger',
    sandwich: 'sandwich',
    'hot dog': 'sandwich',
    taco: 'taco',
    burrito: 'burrito',
    salad: 'salad',
    soup: 'soup',
    pasta: 'pasta',
    spaghetti: 'spaghetti',
    noodles: 'noodles',
    rice: 'rice',
    bread: 'bread',
    cake: 'cake',
    cookie: 'cookie',
    'ice cream': 'ice cream',
    apple: 'apple',
    banana: 'banana',
    orange: 'orange',

    // Object-to-food mappings for general models
    plate: 'mixed meal',
    bowl: 'soup',
    cup: 'beverage',
    mug: 'beverage',
    fork: 'mixed meal',
    spoon: 'soup',
    knife: 'mixed meal',
    'dining table': 'mixed meal',
    restaurant: 'mixed meal',
    food: 'mixed meal',
    meal: 'mixed meal',
  }

  // Find best match
  for (const [key, foodItem] of Object.entries(foodMappings)) {
    if (normalizedLabel.includes(key)) {
      return foodItem
    }
  }

  // If no specific mapping, assume it's a general meal
  return 'mixed meal'
}

export const estimateNutrition = (foodLabel: string): NutritionInfo => {
  // Map the classification result to a food item
  const mappedFood = mapToFoodItem(foodLabel)

  // Try to find exact match first
  const normalizedLabel = mappedFood.toLowerCase().replace(/[_\s]+/g, ' ')

  // Look for partial matches in the nutrition database
  for (const [key, nutrition] of Object.entries(nutritionDatabase)) {
    if (normalizedLabel.includes(key) || key.includes(normalizedLabel)) {
      return nutrition
    }
  }

  // Default fallback nutrition for mixed meals
  return { calories: 300, protein: 15, carbs: 35, fat: 12, fiber: 4 }
}
