import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'prefer-const': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'vue/html-self-closing': 'off',
    },
  },
  {
    // Enforce defineWrappedEventHandler in all server API routes for consistent
    // error handling and structured error responses.
    files: ['server/api/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="defineEventHandler"]',
          message:
            'Use the wrapped event handler utility instead of bare defineEventHandler for consistent error handling',
        },
      ],
    },
  }
)
