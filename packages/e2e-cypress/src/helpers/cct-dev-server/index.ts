/* eslint-disable */
import { join } from 'path';

type AvailableBundlers = 'vite' | 'webpack';

function getPackageJson() {
  return require(join(process.cwd(), 'package.json'));
}

async function quasarSharedConfig(
  quasarAppPackage: string,
  bundler: AvailableBundlers,
) {
  const {
    default: { extensionRunner },
  } = await import(`${quasarAppPackage}/lib/app-extension/extensions-runner`);
  const {
    default: { getQuasarCtx },
  } = await import(`${quasarAppPackage}/lib/utils/get-quasar-ctx`);
  const {
    default: { QuasarConfFile },
  } = await import(
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

  const {
    default: { quasarSpaConfig },
  } = await import(`${quasarAppPackage}/lib/modes/spa/spa-config`);

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

  let quasarAppPackage = `@quasar/app-${bundler}`;

  if (bundler === 'webpack') {
    if (!devDependencies.hasOwnProperty(quasarAppPackage)) {
      quasarAppPackage = '@quasar/app';
    }
  }

  const configExtractor =
    bundler === 'vite' ? quasarViteConfig : quasarWebpackConfig;

  return {
    framework: 'vue',
    bundler,
    [`${bundler}Config`]: async () => await configExtractor(quasarAppPackage),
  };
}
