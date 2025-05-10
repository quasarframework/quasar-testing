// @ts-check

import { defineConfig, devices } from '@playwright/experimental-ct-vue';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
<% if (codeCoverageIsEnabled) { %> import istanbul from 'vite-plugin-istanbul'; <% } %>
// import { fileURLToPath } from 'node:url';
// import AutoImport from 'unplugin-auto-import/vite';
// import Components from 'unplugin-vue-components/vite';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/components',
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotDir: './__snapshots__',
  /* Maximum time one test can run for. */
  timeout: 10 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Port to use for Playwright component endpoint. */
    ctPort: 3100,

    ctViteConfig: {
      build: {
        sourcemap: true
      },
      plugins: [
        vue({ template: { transformAssetUrls } }),
        // AutoImport({
        //   imports: [
        //     'vue',
        //     'vue-router',
        //     '@vueuse/head',
        //     'pinia',
        //     'quasar',
        //     {
        //       '@/store': ['useStore'],
        //     },
        //   ],
        //   dts: 'src/auto-imports.d.ts',
        //   eslintrc: {
        //     enabled: true,
        //   },
        // }),
        // Components({
        //   dirs: ['src/components'],
        //   extensions: ['vue'],
        // }),
        quasar({
          // sassVariables: fileURLToPath(
          //   new URL('./src/quasar-variables.sass', import.meta.url),
          // ),
        }),
        <% if(codeCoverageIsEnabled) { %>
          // Instrument the code for nyc/istanbul code coverage
          istanbul({
            include: ['src/**/*'],
            exclude: ['node_modules', 'test/', 'dist/', 'coverage/', '__tests__'],
            extension: ['.js', '.ts', '.vue'],
            requireEnv: false,
            forceBuildInstrument: true,
            checkProd: false,
            cypress: false,
          }) <% } %>
        ],
  },
},

  /* Configure projects for major browsers */
  projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
],
});


