import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-console': 'off', // Allow console statements in development
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    '@typescript-eslint/no-explicit-any': 'warn', // Make any type warnings instead of errors
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/html-self-closing': 'off', // Let Prettier handle this formatting
  },
})
