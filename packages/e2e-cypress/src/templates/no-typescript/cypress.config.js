import { defineConfig } from 'cypress';
import { injectDevServer } from '@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server';

export default defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  video: true,
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:<%= devServerPort %>/',
    specPattern: 'test/cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'test/cypress/support/index.ts',
  },
  component: {
    setupNodeEvents(on, config) {},
    supportFile: 'test/cypress/support/component.ts',
    specPattern: 'src/**/*.spec.ts',
    devServer: async (cypressDevServerConfig) => injectDevServer(cypressDevServerConfig)
  }
});
