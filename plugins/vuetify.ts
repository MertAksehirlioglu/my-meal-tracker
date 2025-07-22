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
    primary: '#43A047',        // Primary Green
    secondary: '#FFB300',      // Accent Orange
    background: '#F9FBE7',     // Background Light
    surface: '#FFFFFF',        // Default surface
    error: '#E53935',          // Error Red
    info: '#43A047',           // Use primary for info
    success: '#43A047',        // Use primary for success
    warning: '#FFB300',        // Accent Orange
    onPrimary: '#FFFFFF',      // Text on primary
    onSecondary: '#FFFFFF',    // Text on secondary
    onBackground: '#757575',   // Neutral Gray for text
    onSurface: '#757575',      // Neutral Gray for text
    onError: '#FFFFFF',        // Text on error
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