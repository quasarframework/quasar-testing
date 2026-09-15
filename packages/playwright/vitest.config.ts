import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The templates hold Playwright specs, which this runner must not pick up.
    include: ['src/**/*.test.ts'],
  },
});
