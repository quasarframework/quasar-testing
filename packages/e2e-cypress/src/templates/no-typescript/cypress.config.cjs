<% if (shouldAddCodeCoverage) { %>
const registerCodeCoverageTasks = require('@cypress/code-coverage/task');
<% } %>
const { quasarComponentTestingConfig } = require('@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server');
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  video: true,
  allowCypressEnv: false,
  e2e: {
<% if (shouldAddCodeCoverage) { %>
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },
<% } else { %>
    // setupNodeEvents(on, config) {},
<% } %>
    baseUrl: 'http://localhost:<%= devServerPort %>/',
    supportFile: 'test/cypress/support/e2e.js',
    specPattern: 'test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  component: {
<% if (shouldAddCodeCoverage) { %>
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },
<% } else { %>
    // setupNodeEvents(on, config) {},
<% } %>
    ...quasarComponentTestingConfig(),
    supportFile: 'test/cypress/support/component.js',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'test/cypress/support/component-index.html',
  },
});
