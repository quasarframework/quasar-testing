/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api) {
  api.compatibleWith('quasar', '^2.6.0');
  // Vitest 1.0 requires Vite 5, which is only officially supported by @quasar/app-vite v2
  // Yet, there are workarounds to make @quasar/app-vite@v1 work with Vite 5, so we aren't restricting this AE only to v2
  // See https://github.com/quasarframework/quasar/issues/14077
  api.compatibleWith('@quasar/app-vite', '^1.6.0 || ^2.0.0-alpha.44');
};
