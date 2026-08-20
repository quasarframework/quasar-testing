/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

import { defineIndexScript } from '#q-app';

export default defineIndexScript((api) => {
  api.compatibleWith('quasar', '^2.24.0');
  api.compatibleWith('@quasar/app-vite', '^3.0.0');
});
