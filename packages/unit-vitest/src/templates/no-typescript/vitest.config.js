import { defineConfig, mergeConfig } from 'vitest/config';
import { quasarViteTestingConfig } from '@quasar/quasar-app-extension-testing-unit-vitest/config';

// https://vitest.dev/config/
export default defineConfig(async () =>
  mergeConfig(await quasarViteTestingConfig(), {
    test: {
      environment: 'happy-dom',
      setupFiles: 'test/vitest/setup-file.js',
      include: [
        // Matches vitest tests in any subfolder of 'src' or into 'test/vitest/__tests__'
        // Matches all files with extension 'js', 'jsx', 'ts' and 'tsx'
        'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
    },
  }),
);
