export async function generateWebpackConfig(
  mode: string = 'spa',
): Promise<{ renderer: Record<string, any> }> {
  const extensionRunner = require('@quasar/app/lib/app-extension/extensions-runner');
  const getQuasarCtx = require('@quasar/app/lib/helpers/get-quasar-ctx');

  const ctx = getQuasarCtx({
    mode,
    target: void 0,
    debug: false,
    dev: true,
    prod: false,
  });

  const QuasarConfFile = require('@quasar/app/lib/quasar-conf-file');

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile(ctx);

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.error(e);
    return { renderer: {} };
  }
  await quasarConfFile.compile();
  return quasarConfFile.webpackConf;
}
