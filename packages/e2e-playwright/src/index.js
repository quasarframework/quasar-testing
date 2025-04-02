import { enforcedDevServerPort } from './shared.js';

export default function (api) {
  api.compatibleWith('quasar', '^2.0.0');

  if (process.env.NODE_ENV !== 'test') {
    return;
  }

  api.extendQuasarConf(async (conf) => {
    // Let's stop Quasar from opening a browser by default
    conf.devServer.open = false;

    conf.devServer.port = api.prompts.port ?? enforcedDevServerPort;
  });
}
