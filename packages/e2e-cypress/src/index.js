/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

const { enforcedDevServerPort } = require('./shared');

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.0.0');
  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0 || ^2.0.0-alpha.44');
  } else if (api.hasWebpack) {
    // TODO: should be "@quasar/app-webpack" but that is not backward compatible
    // Remove when Qv3 comes out, or when "@quasar/app" is officially deprecated
    api.compatibleWith('@quasar/app', '^3.0.0 || ^4.0.0-alpha.31');
  }

  // We cannot use process.env.CYPRESS here as this code is executed outside Cypress process
  if (process.env.NODE_ENV !== 'test') {
    return;
  }

  api.extendQuasarConf(async (conf) => {
    // Prevent Quasar from opening the project into a new browser
    // tab as Cypress opens its own window
    conf.devServer.open = false;

    // Force a specific port for Cypress
    conf.devServer.port = api.prompts.port ?? enforcedDevServerPort;
  });

  if (api.prompts.options.includes('code-coverage')) {
    if (api.hasVite) {
      // TODO: known problem with Vue3 + Vite source maps: https://github.com/iFaxity/vite-plugin-istanbul/issues/14
      const { default: istanbul } = await import('vite-plugin-istanbul');

      api.extendViteConf((viteConf) => {
        viteConf.plugins.push(
          istanbul({
            forceBuildInstrument: api.ctx.prod,
          }),
        );
      });
    } else {
      // TODO: add webpack code coverage support
      // See https://www.npmjs.com/package/istanbul-instrumenter-loader
      // https://github.com/vuejs/vue-cli/issues/1363#issuecomment-405352542
      // https://github.com/akoidan/vue-webpack-typescript
    }
  }
};
