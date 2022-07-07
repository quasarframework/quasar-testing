/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */
const path = require('path');

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.0.0');

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0');
  } else if (api.hasWebpack) {
    // TODO: should be "@quasar/app-webpack" but that is not backward compatible
    // Remove when Qv3 comes out
    api.compatibleWith('@quasar/app', '^3.0.0');
  }

  // We cannot use process.env.CYPRESS here as this code is executed outside Cypress process
  // TODO: since v4.1 we use NODE_ENV, but we keep supporting old E2E_TEST variable until next major version
  if (process.env.NODE_ENV !== 'test' && !process.env.E2E_TEST) {
    return;
  }

  // Prevent Quasar from opening the project into a new browser tab as Cypress opens its own window
  api.extendQuasarConf(async (conf) => {
    conf.devServer.open = false;
  });

  if (api.prompts.options.includes('code-coverage')) {
    if (api.hasVite) {
      // TODO: known problem with Vue3 + Vite source maps: https://github.com/iFaxity/vite-plugin-istanbul/issues/14
      const { default: istanbul } = await import('vite-plugin-istanbul');

      api.extendViteConf((viteConf) => {
        viteConf.plugins.push(
          istanbul({
            exclude: ['.quasar/*'],
          }),
        );
      });
    } else {
      if (api.hasWebpack === true) {
        api.extendWebpack((cfg) => {
          cfg.module.rules.push({
            test: /\.(js|ts|vue)$/,
            loader: '@jsdevtools/coverage-istanbul-loader',
            options: { esModules: true },
            enforce: 'post',
            include: path.join(__dirname, '..', '..', '..', '..', 'src'),
            exclude: [/\.(e2e|spec)\.(js|ts)$/, /node_modules/],
          });
        });
      }
    }
  }
};
