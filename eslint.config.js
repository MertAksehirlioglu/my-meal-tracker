import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'prefer-const': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    'vue/html-self-closing': 'off',
  },
})
