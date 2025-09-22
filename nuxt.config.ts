// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  css: ['vuetify/styles'],
  build: {
    transpile: ['vuetify'],
  },
  modules: ['@nuxtjs/supabase', '@nuxt/eslint'],
  runtimeConfig: {
    public: {
      signupDisabled: process.env.NUXT_PUBLIC_SIGNUP_DISABLED === 'true',
    },
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/*'], // Exclude all pages from auth guards
    },
  },
})
