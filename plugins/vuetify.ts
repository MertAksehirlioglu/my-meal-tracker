// plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { defineNuxtPlugin } from '#app'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const light = {
  dark: false,
  colors: {
    primary: '#1A2E1C', // Deep forest green — main brand
    secondary: '#E07A5F', // Terra cotta — CTAs & accents
    accent: '#F0E6D3', // Warm parchment — highlights
    background: '#F9F7F4', // Warm off-white — app background
    surface: '#FFFFFF', // White — cards & containers
    'surface-variant': '#F5F5F5', // Slightly darker surface for alternating rows
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

const dark = {
  dark: true,
  colors: {
    primary: '#4CAF73', // Lighter green for dark bg
    secondary: '#E07A5F', // Same terra cotta works
    accent: '#3A3A2E', // Muted warm accent
    background: '#121212', // Standard dark bg
    surface: '#1E1E1E', // Card bg
    'surface-variant': '#2C2C2C', // Slightly lighter surface for alternating rows
    error: '#CF6679',
    info: '#4A90A4',
    success: '#4CAF73',
    warning: '#E8A838',
    onPrimary: '#001A05',
    onSecondary: '#FFFFFF',
    onBackground: '#E8E3DC',
    onSurface: '#D4CFC8',
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
      defaultTheme: 'light',
      themes: {
        light,
        dark,
      },
    },
  })
  nuxtApp.vueApp.use(vuetify)
})
