/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api) {
  api.compatibleWith('quasar', '^2.0.4');

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0-beta.8');
  } else if (api.hasWebpack) {
    // TODO: should be "@quasar/app-webpack" but that is not backward compatible
    // Remove when Qv3 comes out
    api.compatibleWith('@quasar/app', '^3.0.0');
  }
};
