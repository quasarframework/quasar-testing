/* eslint-disable */
import { join } from 'path';
import { satisfies, coerce } from 'semver';

type AvailableBundlers = 'vite' | 'webpack';

function getPackageJson() {
  return require(join(process.cwd(), 'package.json'));
}

async function getSharedConfigImports(
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

  return {
    extensionRunner,
    getQuasarCtx,
    QuasarConfFile,
  };
}

async function getSharedConfigImportsForOldVersion(
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
  supportsOldVersion: boolean,
) {
  const { extensionRunner, getQuasarCtx, QuasarConfFile } = supportsOldVersion
    ? await getSharedConfigImportsForOldVersion(quasarAppPackage, bundler)
    : await getSharedConfigImports(quasarAppPackage, bundler);

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

async function quasarWebpackConfig(
  quasarAppPackage: string,
  supportsOldVersion: boolean,
) {
  const { QuasarConfFile, ctx } = await quasarSharedConfig(
    quasarAppPackage,
    'webpack',
    supportsOldVersion,
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

async function getQuasarViteSpaConfig(
  quasarAppPackage: string,
  supportsOldVersion: boolean,
) {
  if (supportsOldVersion) {
    const { default: quasarSpaConfig } = await import(
      `${quasarAppPackage}/lib/modes/spa/spa-config`
    );
    return quasarSpaConfig;
  }

  const {
    default: { quasarSpaConfig },
  } = await import(`${quasarAppPackage}/lib/modes/spa/spa-config`);

  return quasarSpaConfig;
}

async function quasarViteConfig(
  quasarAppPackage: string,
  supportsOldVersion: boolean,
) {
  const { QuasarConfFile, ctx } = await quasarSharedConfig(
    quasarAppPackage,
    'vite',
    supportsOldVersion,
  );
  const quasarConfFile = new QuasarConfFile({ ctx });

  const quasarConf = await quasarConfFile.read();
  if (quasarConf.error !== void 0) {
    console.log(quasarConf.error);
  }

  const quasarSpaConfig = await getQuasarViteSpaConfig(
    quasarAppPackage,
    supportsOldVersion,
  );

  // [1] -> https://github.com/cypress-io/cypress/issues/22505#issuecomment-1277855100
  // [1] Make sure to use the root for predictability
  quasarConf.publicPath = '/';

  const result = await quasarSpaConfig['vite'](quasarConf);

  // [1] Delete base so it can correctly be set by Cypress
  delete result.base;

  return result;
}

function checkIfOldVersion(bundler: AvailableBundlers, version: string) {
  if (bundler === 'vite') {
    return satisfies(coerce(version) || '', '^1.0.0');
  }

  return satisfies(coerce(version) || '', '^3.0.0');
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

  const isOldVersion = checkIfOldVersion(
    bundler,
    devDependencies[quasarAppPackage],
  );

  const configExtractor =
    bundler === 'vite' ? quasarViteConfig : quasarWebpackConfig;

  return {
    framework: 'vue',
    bundler,
    [`${bundler}Config`]: async () =>
      await configExtractor(quasarAppPackage, isOldVersion),
  };
}
