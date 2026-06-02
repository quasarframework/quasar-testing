/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

import type { IndexAPI } from '@quasar/app-vite';

export default function index(api: IndexAPI) {
  api.compatibleWith('quasar', '^2.12.7');
  api.compatibleWith('@quasar/app-vite', '^2.4.0');
}
