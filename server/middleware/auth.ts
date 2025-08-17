import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Only apply auth middleware to API routes that need authentication
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  // Skip auth for public endpoints
  const publicEndpoints = ['/api/health', '/api/public']
  if (
    publicEndpoints.some((endpoint) => event.node.req.url?.startsWith(endpoint))
  ) {
    return
  }

  try {
    // Get authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For now, skip auth check - in production this should throw an error
      // This allows the app to work during development
      console.warn(
        'No authorization header found for API request:',
        event.node.req.url
      )
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify the JWT token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.warn('Invalid token for API request:', event.node.req.url)
      return
    }

    // Add user to event context
    event.context.user = user
  } catch (error) {
    console.error('Auth middleware error:', error)
    // For development, we'll log the error but not block the request
    // In production, this should throw an authentication error
  }
})
