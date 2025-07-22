import { ref, computed } from 'vue'

const loading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Login
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) error.value = authError.message
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
    const { error: updateError } = await supabase.auth.updateUser({ data: profile })
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
    register,
    logout,
    updateProfile,
    resetError,
    isAuthenticated,
  }
}