/**
 * Composable for making authenticated API requests
 * Automatically adds Authorization header with JWT token
 */
export const useAuthenticatedFetch = () => {
  const supabase = useSupabaseClient()

  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      throw new Error('No valid session found. Please log in again.')
    }

    // Merge headers with Authorization
    const defaultHeaders: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
    }

    // Only add Content-Type if not FormData (browser will set it automatically)
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json'
    }

    const headers = {
      ...defaultHeaders,
      ...(options.headers || {}),
    }

    // Make the request with auth headers
    return fetch(url, {
      ...options,
      headers,
    })
  }

  return { authenticatedFetch }
}
