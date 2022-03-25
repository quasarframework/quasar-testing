/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api) {
  api.compatibleWith('quasar', '^2.0.0');

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0-beta.8');
  } else if (api.hasWebpack) {
    // TODO: should be "@quasar/app-webpack" but that is not backward compatible
    // Remove when Qv3 comes out
    api.compatibleWith('@quasar/app', '^3.0.0');
  }

  api.extendQuasarConf((conf) => {
    // TODO: we should remove this in next AE major version, since Cypress 9.1 set a process.env.CYPRESS variable for us
    // See https://github.com/cypress-io/cypress/issues/18805
    if (process.env.E2E_TEST) {
      conf.devServer.open = false;
    }
  });
};
