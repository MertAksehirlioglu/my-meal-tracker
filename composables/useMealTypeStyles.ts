const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: 'mdi-sunrise',
  lunch: 'mdi-sunny',
  dinner: 'mdi-moon-waning-crescent',
  snack: 'mdi-food-apple',
}

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: 'orange',
  lunch: 'green',
  dinner: 'purple',
  snack: 'blue',
}

export const useMealTypeStyles = () => {
  const getMealTypeIcon = (mealType: string) =>
    MEAL_TYPE_ICONS[mealType] ?? 'mdi-food'

  const getMealTypeColor = (mealType: string) =>
    MEAL_TYPE_COLORS[mealType] ?? 'grey'

  return { getMealTypeIcon, getMealTypeColor }
}
