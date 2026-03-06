type ValidationRule = (_value: unknown) => true | string

export const useFormValidation = () => {
  const required: ValidationRule = (value) =>
    !!value || 'This field is required'

  const positive: ValidationRule = (value) => {
    if (value === null || value === undefined || value === '') return true
    const numValue = Number(value)
    return (!isNaN(numValue) && numValue >= 0) || 'Value must be positive'
  }

  const email: ValidationRule = (value) =>
    !value || /.+@.+\..+/.test(String(value)) || 'Email must be valid'

  const range =
    (min: number, max: number, label: string): ValidationRule =>
    (value) =>
      !value ||
      (Number(value) >= min && Number(value) <= max) ||
      `${label} must be between ${min}-${max}`

  const minLength =
    (min: number): ValidationRule =>
    (value) =>
      !value ||
      String(value).length >= min ||
      `Must be at least ${min} characters`

  const maxLength =
    (max: number): ValidationRule =>
    (value) =>
      !value ||
      String(value).length <= max ||
      `Must be ${max} characters or less`

  // Common validation rules for specific fields
  const weightRule = range(30, 300, 'Weight')
  const heightRule = range(100, 250, 'Height')
  const ageRule = range(1, 120, 'Age')
  const calorieRule = range(0, 10000, 'Calories')
  const proteinRule = range(0, 500, 'Protein')
  const carbsRule = range(0, 1000, 'Carbs')
  const fatRule = range(0, 500, 'Fat')

  // Aliases for backwards compatibility
  const requiredRule = required
  const positiveRule = positive

  return {
    required,
    positive,
    email,
    range,
    minLength,
    maxLength,
    weightRule,
    heightRule,
    ageRule,
    calorieRule,
    proteinRule,
    carbsRule,
    fatRule,
    requiredRule,
    positiveRule,
  }
}
