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
    primary: '#1A2E1C', // Deep forest green — main brand
    secondary: '#E07A5F', // Terra cotta — CTAs & accents
    accent: '#F0E6D3', // Warm parchment — highlights
    background: '#F9F7F4', // Warm off-white — app background
    surface: '#FFFFFF', // White — cards & containers
    error: '#D94F3B',
    info: '#4A90A4',
    success: '#3D7A5B',
    warning: '#E8A838',
    onPrimary: '#F5F0E8',
    onSecondary: '#FFFFFF',
    onBackground: '#1C1C1E',
    onSurface: '#3A4A3B',
    onError: '#FFFFFF',
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
