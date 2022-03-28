/* eslint-disable */
/// <reference types="cypress" />
import { promisify } from 'util';
import { exec as originalExec } from 'child_process';

type AvailableBundlers = 'vite' | 'webpack';

const exec = promisify(originalExec);

async function exportQuasarConfig(bundler: AvailableBundlers): Promise<any> {
  let quasarAppPackage = `@quasar/app-${bundler}`;

  if (bundler === 'webpack') {
    try {
      await exec('npm ls @quasar/app-webpack');
    } catch (e) {
      quasarAppPackage = '@quasar/app';
    }
  }

  const { default: extensionRunner } = await import(
    `${quasarAppPackage}/lib/app-extension/extensions-runner`
  );
  const { default: getQuasarCtx } = await import(
    `${quasarAppPackage}/lib/helpers/get-quasar-ctx`
  );
  const { default: QuasarConfFile } = await import(
    `${quasarAppPackage}/lib/quasar-${
      bundler === 'vite' ? 'config' : 'conf'
    }-file`
  );

  const ctx = getQuasarCtx({
    mode: 'spa',
    target: void 0,
    debug: false,
    dev: true,
    prod: false,
  });

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  if (bundler === 'vite') {
    const quasarConfFile = new QuasarConfFile({ ctx });

    const quasarConf = await quasarConfFile.read();
    if (quasarConf.error !== void 0) {
      console.log(quasarConf.error);
    }

    const { default: generateConfig } = await import(
      `${quasarAppPackage}/lib/modes/spa/spa-config`
    );

    return generateConfig['vite'](quasarConf);
  } else {
    const {
      default: { splitWebpackConfig },
    } = await import(`${quasarAppPackage}/lib/webpack/symbols`);

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
}

export const injectDevServer: Cypress.PluginConfig = (on, config) => {
  on('dev-server:start', async (options) => {
    let bundler: AvailableBundlers;

    try {
      await exec('npm ls @quasar/app-vite');
      bundler = 'vite';
    } catch (e) {
      bundler = 'webpack';
    }

    const { startDevServer } = await import(`@cypress/${bundler}-dev-server`);

    return startDevServer({
      options,
      [`${bundler}Config`]: await exportQuasarConfig(bundler),
    });
  });
};
