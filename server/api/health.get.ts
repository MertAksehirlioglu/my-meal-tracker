// eslint-disable-next-line no-restricted-syntax
export default defineEventHandler(async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'MealSnap API is running',
  }
})
