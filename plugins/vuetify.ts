// plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { defineNuxtPlugin } from '#app'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const customTheme = {
  dark: false,
  colors: {
    primary: '#00796b', // Teal - Main brand color
    secondary: '#004d40', // Dark Teal - Complementary color
    accent: '#e0f2f1', // Light Teal - Highlights and accents
    background: '#f1f8e9', // Light Green - App background
    surface: '#ffffff', // White - Card and container backgrounds
    error: '#d32f2f', // Red - Error messages
    info: '#0288d1', // Blue - Informational messages
    success: '#388e3c', // Green - Success messages
    warning: '#fbc02d', // Yellow - Warnings
    onPrimary: '#ffffff', // White - Text on primary color
    onSecondary: '#ffffff', // White - Text on secondary color
    onBackground: '#37474f', // Dark Gray - Text on background
    onSurface: '#37474f', // Dark Gray - Text on surface
    onError: '#ffffff', // White - Text on error color
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
    theme: {
      defaultTheme: 'customTheme',
      themes: {
        customTheme,
      },
    },
  })
  nuxtApp.vueApp.use(vuetify)
})
