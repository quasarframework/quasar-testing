import { enforcedDevServerPort } from './shared.js';

export default async function (api) {
  api.compatibleWith('quasar', '^2.0.0');
  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0 || ^2.0.0');
  } else if (api.hasWebpack) {
    api.compatibleWith('@quasar/app-webpack', '^3.11.0 || ^4.0.0');
  }

  if (process.env.NODE_ENV !== 'test') {
    return;
  }

  api.extendQuasarConf(async (conf) => {
    // Let's stop Quasar from opening a browser by default
    conf.devServer.open = false;

    conf.devServer.port = api.prompts.port ?? enforcedDevServerPort;
  });

  if (api.prompts.enableCodeCoverage && api.hasVite) {
    // TODO: known problem with Vue3 + Vite source maps: https://github.com/iFaxity/vite-plugin-istanbul/issues/14
    const { default: istanbul } = await import('vite-plugin-istanbul');

    api.extendViteConf((viteConf) => {
      viteConf.plugins.push(
        istanbul({
          forceBuildInstrument: api.ctx.prod,
          requireEnv: true,
        }),
      );
    });
  }
}
