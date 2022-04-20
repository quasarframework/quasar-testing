/* eslint-disable */
/// <reference types="cypress" />

type AvailableBundlers = 'vite' | 'webpack';

async function exportQuasarConfig(bundler: AvailableBundlers): Promise<any> {
  let quasarAppPackage = `@quasar/app-${bundler}`;

  if (bundler === 'webpack') {
    const { devDependencies } = require('package.json')
    if (!devDependencies.hasOwnProperty(quasarAppPackage)) {
      quasarAppPackage = '@quasar/app'
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
    const { devDependencies } = require('package.json')
    const bundler: AvailableBundlers = devDependencies.hasOwnProperty('@quasar/app-vite') ? 
      'vite' : 
      'webpack';

    const { startDevServer } = await import(`@cypress/${bundler}-dev-server`);

    return startDevServer({
      options,
      [`${bundler}Config`]: await exportQuasarConfig(bundler),
    });
  });
};
