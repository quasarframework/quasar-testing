/* eslint-disable */
import {
  startDevServer,
  CypressWebpackDevServerConfig,
} from '@cypress/webpack-dev-server';

// @ts-expect-error
import extensionRunner from '@quasar/app/lib/app-extension/extensions-runner';
// @ts-expect-error
import getQuasarCtx from '@quasar/app/lib/helpers/get-quasar-ctx';
// @ts-expect-error
import QuasarConfFile from '@quasar/app/lib/quasar-conf-file';
// @ts-expect-error
import { splitWebpackConfig } from '@quasar/app/lib/webpack/symbols';

async function exportWebpackConfig(): Promise<
  CypressWebpackDevServerConfig['webpackConfig']
> {
  const ctx = getQuasarCtx({
    mode: 'spa',
    target: void 0,
    debug: false,
    dev: true,
    prod: false,
  });

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile(ctx);

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.log(e);
    return;
  }
  await quasarConfFile.compile();

  const configEntries = splitWebpackConfig(quasarConfFile.webpackConf, 'spa');

  return configEntries[0].webpack;
}

export const injectDevServer: Cypress.PluginConfig = (on, config) => {
  on('dev-server:start', async (options) => {
    const webpackConfig = await exportWebpackConfig();

    return startDevServer({
      options,
      webpackConfig,
    });
  });
};
