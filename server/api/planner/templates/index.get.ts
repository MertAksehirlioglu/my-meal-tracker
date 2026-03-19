import type { MealTemplate } from '~/server/database/schemas'
import { requireAuth } from '~/server/utils/auth'
import { isDemoUser } from '~/server/utils/demo'
import { getDemoPlannerTemplates } from '~/server/utils/demo-data'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)

  if (isDemoUser(user)) {
    return { success: true, data: getDemoPlannerTemplates(user.id) }
  }

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  const supabase = getSupabaseClient()

  let req = supabase
    .from('meal_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (search) {
    req = req.ilike('name', `%${search}%`)
  }

  const { data, error } = await req

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch templates',
    })
  }

  return { success: true, data: data as MealTemplate[] }
})
