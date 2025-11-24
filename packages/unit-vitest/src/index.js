/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api) {
  api.compatibleWith('quasar', '^2.12.7');
  // Vitest 1.0 requires Vite 5, which is only officially supported by @quasar/app-vite v2
  // Yet, there are workarounds to make @quasar/app-vite@v1 work with Vite 5, so we aren't restricting this AE only to v2
  // See https://github.com/quasarframework/quasar/issues/14077
  // However, we do need to exclude @quasar/app-vite v2.4.0 and above, which uses Vite 7
  // We could have supported Vite 7 by forcing Vitest 3.2 usage,
  // but that would require to drop Node 18 due to `happy-dom` version bump, which requires Node 20+
  api.compatibleWith('@quasar/app-vite', '^1.6.0 || >=2.0.0 <2.4.0');
};
