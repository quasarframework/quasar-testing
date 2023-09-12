/* eslint-disable */
import { join } from 'path';

type AvailableBundlers = 'vite' | 'webpack';

function getPackageJson() {
  return require(join(process.cwd(), 'package.json'));
}

async function getSharedConfigImports(
  quasarAppPackage: string,
  bundler: AvailableBundlers,
) {
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

  return {
    extensionRunner,
    getQuasarCtx,
    QuasarConfFile,
  };
}

async function quasarSharedConfig(
  quasarAppPackage: string,
  bundler: AvailableBundlers,
) {
  const { extensionRunner, getQuasarCtx, QuasarConfFile } =
    await getSharedConfigImports(quasarAppPackage, bundler);

  const ctx = getQuasarCtx({
    mode: 'spa',
    target: void 0,
    debug: false,
    dev: true,
    prod: false,
  });

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  return {
    quasarAppPackage,
    QuasarConfFile,
    ctx,
  };
}

async function quasarWebpackConfig(quasarAppPackage: string) {
  const { QuasarConfFile, ctx } = await quasarSharedConfig(
    quasarAppPackage,
    'webpack',
  );

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

async function getQuasarViteSpaConfig(quasarAppPackage: string) {
  const { default: quasarSpaConfig } = await import(
    `${quasarAppPackage}/lib/modes/spa/spa-config`
  );

  return quasarSpaConfig;
}

async function quasarViteConfig(quasarAppPackage: string) {
  const { QuasarConfFile, ctx } = await quasarSharedConfig(
    quasarAppPackage,
    'vite',
  );
  const quasarConfFile = new QuasarConfFile({ ctx });

  const quasarConf = await quasarConfFile.read();
  if (quasarConf.error !== void 0) {
    console.log(quasarConf.error);
  }

  const quasarSpaConfig = await getQuasarViteSpaConfig(quasarAppPackage);

  // [1] -> https://github.com/cypress-io/cypress/issues/22505#issuecomment-1277855100
  // [1] Make sure to use the root for predictability
  quasarConf.publicPath = '/';

  const result = await quasarSpaConfig['vite'](quasarConf);

  // [1] Delete base so it can correctly be set by Cypress
  delete result.base;

  return result;
}

export function injectQuasarDevServerConfig() {
  const { devDependencies } = getPackageJson();
  const bundler: AvailableBundlers = devDependencies.hasOwnProperty(
    '@quasar/app-vite',
  )
    ? 'vite'
    : 'webpack';

  const quasarAppPackage =
    bundler === 'webpack' &&
    !devDependencies.hasOwnProperty('@quasar/app-webpack')
      ? '@quasar/app'
      : `@quasar/app-${bundler}`;

  const configExtractor =
    bundler === 'vite' ? quasarViteConfig : quasarWebpackConfig;

  return {
    framework: 'vue',
    bundler,
    [`${bundler}Config`]: async () => {
      // Trying q/app-vite 2+ & q/app-webpack 4+ specs
      try {
        // we workaround the build system because
        // we explicitly need an "import()" statement
        // otherwise this will fail for q/app-vite (as the imported file is an ES6 module)
        const promise = eval('import(`${quasarAppPackage}/lib/testing.js`);');
        const { getTestingConfig } = await promise;
        return getTestingConfig();
      } catch (_) {}

      return configExtractor(quasarAppPackage);
    },
  };
}
