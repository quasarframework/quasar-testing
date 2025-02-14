<% if (shouldAddCodeCoverage) { %>const registerCodeCoverageTasks = require('@cypress/code-coverage/task');<% } %>
const { injectQuasarDevServerConfig } = require('@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server');
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  video: true,
  e2e: {
    <% if (shouldAddCodeCoverage) { %>setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },<% }
    else { %>// setupNodeEvents(on, config) {},<% } %>
    baseUrl: 'http://localhost:<%= devServerPort %>/',
    supportFile: 'test/cypress/support/e2e.js',
    specPattern: 'test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  component: {
    <% if (shouldAddCodeCoverage) { %>setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },<% }
    else { %>// setupNodeEvents(on, config) {},<% } %>
    supportFile: 'test/cypress/support/component.js',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'test/cypress/support/component-index.html',
    devServer: injectQuasarDevServerConfig(),
    <% if (requiresPublicPath) {%>// If not set it will break tests related to components that load public assets. See https://github.com/quasarframework/quasar-testing/issues/379
    devServerPublicPathRoute: '' <% } %>
  },
});
