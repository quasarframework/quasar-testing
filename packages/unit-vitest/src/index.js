/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

module.exports = function (api) {
  api.compatibleWith('quasar', '^2.12.7');
  // Vitest 4 requires Vite 6 or newer.
  // @quasar/app-vite v2.4.0 and above uses Vite 7, which avoids Vite type mismatches between the app and Vitest.
  api.compatibleWith('@quasar/app-vite', '^2.4.0');
};
