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

  // Demo Login
  const loginDemo = async () => {
    loading.value = true
    error.value = null

    const config = useRuntimeConfig()
    const demoEmail = config.public.demoEmail
    const demoPassword = config.public.demoPassword

    if (!demoEmail) {
      error.value =
        'Demo email not configured. Please set NUXT_PUBLIC_DEMO_EMAIL environment variable.'
      loading.value = false
      return { user: user.value, error: error.value }
    }

    if (!demoPassword) {
      error.value =
        'Demo password not configured. Please set NUXT_PUBLIC_DEMO_PASSWORD environment variable.'
      loading.value = false
      return { user: user.value, error: error.value }
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

    if (authError) {
      error.value = authError.message
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
