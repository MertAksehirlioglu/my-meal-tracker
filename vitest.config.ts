import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'lib/**/*.ts',
        'composables/**/*.ts',
        'server/utils/**/*.ts',
      ],
      exclude: [
        'lib/huggingface.ts',
        'lib/openai.ts',
        'lib/tensorflow.ts',
        'lib/ai-providers.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './'),
      '@': resolve(__dirname, './'),
    },
  },
})
