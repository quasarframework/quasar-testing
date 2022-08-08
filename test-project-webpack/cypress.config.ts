import { defineConfig } from 'cypress';
import { quasarWebpackConfig } from '@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server';
import { devServer } from '@cypress/webpack-dev-server';

export default defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  video: true,
  e2e: {
    baseUrl: 'http://localhost:8080/',
    specPattern: 'test/cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'test/cypress/support/e2e.ts',
  },
  component: {
    supportFile: 'test/cypress/support/component.ts',
    specPattern: 'src/**/*.spec.{js,jsx,ts,tsx}',
    devServer: async (devServerOptions) => {
      return devServer({
        ...devServerOptions,
        framework: 'vue',
        webpackConfig: await quasarWebpackConfig(),
      });
    },
    indexHtmlFile: 'test/cypress/support/component-index.html',
  },
});
