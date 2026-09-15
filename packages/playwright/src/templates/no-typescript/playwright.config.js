import { defineConfig, devices } from '@playwright/test';

const devServerPort = <%= devServerPort %>;
const appUrl = `http://localhost:${devServerPort}/`;
// mount() navigates to the gallery page served by "quasar dev"
const galleryUrl = `${appUrl}playwright/gallery/index.html`;

// https://playwright.dev/docs/test-configuration
export default defineConfig({
  forbidOnly: !!process.env.CI,
  // Make tests within files run in parallel too
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    // Tests do not retry locally, so a failed test keeps its trace. On CI the retry records it.
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
<% if (shouldAddCodeCoverage) { %>
    // The collector opens a page for every test, so it stays off without this
    coverage: true,
<% } %>
  },
  projects: [
    {
      name: 'e2e',
      testDir: 'test/playwright/e2e',
      use: { ...devices['Desktop Chrome'], baseURL: appUrl },
    },
    {
      name: 'components',
      // A component test does much less than an e2e test. The default of 30
      // seconds is too long for it.
      timeout: 10_000,
      // Runs the specs under components/, and under demo/ (if scaffolded)
      testDir: 'test/playwright',
      // Matches the e2e folder on any checkout path and on both separators
      testIgnore: /[\\/]test[\\/]playwright[\\/]e2e[\\/]/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: galleryUrl,
        // A service worker would answer requests before page.route() sees them
        serviceWorkers: 'block',
        // Reuse the browser context between component tests. It makes them much faster.
        reuseContext: true,
      },
    },
    // {
    //   name: 'e2e-firefox',
    //   testDir: 'test/playwright/e2e',
    //   use: { ...devices['Desktop Firefox'], baseURL: appUrl },
    // },
    // {
    //   name: 'e2e-webkit',
    //   testDir: 'test/playwright/e2e',
    //   use: { ...devices['Desktop Safari'], baseURL: appUrl },
    // },
    // Quasar renders differently on a mobile platform. For example, QSelect opens its menu as
    // a dialog, so a mobile project is worth enabling.
    // { name: 'mobile-chrome', use: { ...devices['Pixel 7'], baseURL: appUrl } },
    // { name: 'mobile-safari', use: { ...devices['iPhone 14'], baseURL: appUrl } },
    // { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge', baseURL: appUrl } },
  ],
  webServer: {
    // The tests run against "quasar dev". To run them against the production
    // bundle on CI, build it and serve it. "quasar serve" comes with @quasar/cli.
    // Uncomment the two lines below.
    // command: process.env.CI ? 'quasar build && quasar serve dist/spa --history --port <%= devServerPort %>' : 'quasar dev',
    // timeout: process.env.CI ? 300_000 : 60_000,
    command: 'quasar dev',
    url: appUrl,
    reuseExistingServer: !process.env.CI,
    // This makes the Playwright App Extension force the port, keep the dev server
    // from opening a browser and instrument the app for coverage.
    // The AE reads the port from here, so change devServerPort above and nothing else.
    env: {
      QUASAR_TESTING_PLAYWRIGHT: 'true',
      QUASAR_TESTING_PLAYWRIGHT_PORT: String(devServerPort),
    },
  },
});
