// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['vuetify/styles'],
  build: {
    transpile: ['vuetify']
  },
  modules: ['@nuxtjs/supabase'],
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  supabase: {
    redirectOptions: {
      login: '/login',        // Where to send unauthenticated users
      callback: '/confirm',   // Where to send after email confirmation
      include: ['/home', '/goals', '/snap'] // Pages that don't require auth
    }
  }
})
