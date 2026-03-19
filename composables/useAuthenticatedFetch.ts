/**
 * Composable for making authenticated API requests
 * Automatically adds Authorization header with JWT token
 */
export const useAuthenticatedFetch = () => {
  const supabase = useSupabaseClient()

  const getAccessToken = async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      return session.access_token
    }

    // Retry once by forcing refresh. This helps right after demo login when
    // session state propagation can lag briefly.
    const { data: refreshed, error: refreshError } =
      await supabase.auth.refreshSession()

    if (refreshError) {
      return null
    }

    return refreshed.session?.access_token ?? null
  }

  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      throw new Error('No valid session found. Please log in again.')
    }

    // Merge headers with Authorization
    const defaultHeaders: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
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
