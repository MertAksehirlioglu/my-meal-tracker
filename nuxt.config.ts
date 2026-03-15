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
    // Server-only secrets (never exposed to the browser)
    // DEMO_PASSWORD: used by /api/auth/demo-login so the credential stays server-side
    public: {
      signupDisabled: process.env.NUXT_PUBLIC_SIGNUP_DISABLED === 'true',
      demoEmail: process.env.NUXT_PUBLIC_DEMO_EMAIL,
      // demoPassword intentionally omitted from public — use /api/auth/demo-login instead
      // Used by the CSRF middleware to validate the Origin header on mutation requests.
      // Set NUXT_PUBLIC_APP_URL in production to match your deployed URL (e.g. https://mealsnap.app).
      // To swap the rate-limit store to Redis in production, add to nitro.storage:
      //   cache: { driver: 'redis', url: process.env.REDIS_URL }
      appUrl: process.env.NUXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    },
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap',
        },
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
