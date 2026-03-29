import { ref, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'

const STORAGE_KEY = 'mealsnap-theme'

// Module-level so all consumers share state
const isDark = ref(false)
let initialized = false

export function useDark() {
  const theme = useTheme()

  const applyTheme = (dark: boolean) => {
    theme.global.name.value = dark ? 'dark' : 'light'
  }

  const toggleDark = () => {
    isDark.value = !isDark.value
  }

  // Initialize once per app lifecycle
  onMounted(() => {
    if (initialized) {
      applyTheme(isDark.value)
      return
    }
    initialized = true

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') {
      isDark.value = saved === 'dark'
    } else {
      // Fall back to OS preference on first launch
      isDark.value =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme(isDark.value)

    // Keep in sync if the OS preference changes while the app is open
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          isDark.value = e.matches
        }
      })
  })

  // Persist every change
  watch(isDark, (dark) => {
    applyTheme(dark)
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  })

  return { isDark, toggleDark }
}
