import { devServer as webpackDevServer } from '@cypress/webpack-dev-server';
import { defineConfig } from 'cypress';
import { quasarWebpackConfig } from '@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server';
import DevServerConfig = Cypress.DevServerConfig;

const devServer = async (devServerOptions: DevServerConfig) =>
  webpackDevServer({
    ...devServerOptions,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    webpackConfig: await quasarWebpackConfig(),
    framework: 'vue',
  });

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
    devServer,
    indexHtmlFile: 'test/cypress/support/component-index.html',
  },
});
