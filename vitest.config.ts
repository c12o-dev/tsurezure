import { defineConfig } from 'vitest/config'

// Unit tests for the pure helpers in src/utils (no Astro runtime needed).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
})
