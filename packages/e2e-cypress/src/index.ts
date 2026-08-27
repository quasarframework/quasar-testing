/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

import { defineIndexScript } from '#q-app';
import { normalizePromptsAnswers } from './prompts';

export default defineIndexScript(async (api) => {
  api.compatibleWith('quasar', '^2.24.0');
  api.compatibleWith('@quasar/app-vite', '^3.0.0');
  // Vite 8 requires Cypress 15.14+ for component testing support
  api.compatibleWith('cypress', '^15.14.0');

  // We cannot use process.env.CYPRESS here as this code is executed outside Cypress process
  if (process.env.NODE_ENV !== 'test') {
    return;
  }

  const prompts = normalizePromptsAnswers(api.prompts);

  api.extendQuasarConf(() => ({
    devServer: {
      // Prevent Quasar from opening the project into a new browser
      // tab as Cypress opens its own window
      open: false,
      port: prompts.port,
    },
  }));

  if (prompts.options.includes('code-coverage')) {
    // TODO: known problem with Vue3 + Vite source maps: https://github.com/iFaxity/vite-plugin-istanbul/issues/14
    const { default: istanbul } = await import('vite-plugin-istanbul');

    api.extendViteConf(() => ({
      plugins: [istanbul({ forceBuildInstrument: api.ctx.prod })],
    }));
  }
});
