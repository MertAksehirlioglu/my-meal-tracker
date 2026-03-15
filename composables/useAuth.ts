import { ref, computed } from 'vue'

const loading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Check if current user is demo user
  const isDemoUser = computed(() => {
    const config = useRuntimeConfig()
    const demoEmail = config.public.demoEmail
    return user.value?.email === demoEmail
  })

  // Login
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError) error.value = authError.message
    loading.value = false
    return { user: user.value, error: error.value }
  }

  // Demo Login — calls a server endpoint so the demo password is never sent to the browser
  const loginDemo = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/auth/demo-login', { method: 'POST' })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        error.value = body?.statusMessage || 'Demo login failed'
        loading.value = false
        return { user: user.value, error: error.value }
      }

      const body = await response.json()
      const sessionData = body?.data

      if (!sessionData?.access_token) {
        error.value = 'Demo login failed: no session returned'
        loading.value = false
        return { user: user.value, error: error.value }
      }

      // Set the session on the Supabase client using the tokens returned by the server
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      })

      if (setSessionError) {
        error.value = setSessionError.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Demo login failed'
    }

    loading.value = false
    return { user: user.value, error: error.value }
  }

  // Register
  const register = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    const { error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) error.value = authError.message
    loading.value = false
    return { user: user.value, error: error.value }
  }

  // Logout
  const logout = async () => {
    loading.value = true
    error.value = null
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) error.value = signOutError.message
    loading.value = false
    return { error: error.value }
  }

  // Update Profile
  const updateProfile = async (profile: { name?: string }) => {
    loading.value = true
    error.value = null
    const { error: updateError } = await supabase.auth.updateUser({
      data: profile,
    })
    if (updateError) error.value = updateError.message
    loading.value = false
    return { error: error.value }
  }

  // Reset Error
  const resetError = () => {
    error.value = null
  }

  const isAuthenticated = computed(() => !!user.value)

  return {
    user: computed(() => user.value),
    loading,
    error,
    login,
    loginDemo,
    register,
    logout,
    updateProfile,
    resetError,
    isAuthenticated,
    isDemoUser,
  }
}
