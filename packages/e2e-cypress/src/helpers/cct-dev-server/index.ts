/* eslint-disable */
import {
  startDevServer,
  CypressWebpackDevServerConfig,
} from '@cypress/webpack-dev-server';

import { promisify } from 'util';
import { exec as originalExec } from 'child_process';

const exec = promisify(originalExec);

async function exportWebpackConfig(): Promise<
  CypressWebpackDevServerConfig['webpackConfig']
> {
  let quasarAppPackage: string;
  try {
    await exec('npm ls @quasar/app');
    quasarAppPackage = '@quasar/app';
  } catch (e) {
    quasarAppPackage = '@quasar/app-webpack';
  }

  const { default: extensionRunner } = await import(
    `${quasarAppPackage}/lib/app-extension/extensions-runner`
  );
  const { default: getQuasarCtx } = await import(
    `${quasarAppPackage}/lib/helpers/get-quasar-ctx`
  );
  const { default: QuasarConfFile } = await import(
    `${quasarAppPackage}/lib/quasar-conf-file`
  );
  const {
    default: { splitWebpackConfig },
  } = await import(`${quasarAppPackage}/lib/webpack/symbols`);

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
