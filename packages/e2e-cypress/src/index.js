/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

const { enforcedDevServerPort } = require('./shared');

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.24.0');
  api.compatibleWith('@quasar/app-vite', '^3.0.0');
  // Vite 8 requires Cypress 15.14+ for component testing support
  api.compatibleWith('cypress', '^15.14.0');

  // We cannot use process.env.CYPRESS here as this code is executed outside Cypress process
  if (process.env.NODE_ENV !== 'test') {
    return;
  }

  api.extendQuasarConf(async (conf) => {
    // Prevent Quasar from opening the project into a new browser
    // tab as Cypress opens its own window
    conf.devServer.open = false;

    // Force a specific port for Cypress (prompts may store it as a string)
    conf.devServer.port = Number(api.prompts.port) || enforcedDevServerPort;
  });

  if (api.prompts.options.includes('code-coverage')) {
    // TODO: known problem with Vue3 + Vite source maps: https://github.com/iFaxity/vite-plugin-istanbul/issues/14
    const { default: istanbul } = await import('vite-plugin-istanbul');

    api.extendViteConf((viteConf) => {
      viteConf.plugins.push(
        istanbul({
          forceBuildInstrument: api.ctx.prod,
        }),
      );
    });
  }
};
