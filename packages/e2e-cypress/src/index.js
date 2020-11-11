/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api) {
  api.extendQuasarConf((conf, api) => {
    if (process.env.E2E_TEST) {
      conf.devServer.open = false;

      // If TS is enabled and fork-ts-checker manages ESLint type-checking
      //  it must be instructed to use local tsconfig instead of the root level one,
      //  otherwise it won't include cypress globals types (specified only on the local tsconfig)
      // Note that eslint "parserOptions" options should be overrided to point to the same tsconfig
      //  or type errors won't be emitted (only linting ones will)
      if (
        api.prompts.options.includes('typescript') &&
        conf.supportTS.tsCheckerConfig &&
        conf.supportTS.tsCheckerConfig.eslint
      ) {
        conf.supportTS.tsCheckerConfig.tsconfig = 'test/cypress/tsconfig.json';
      }
    }
  });
};
