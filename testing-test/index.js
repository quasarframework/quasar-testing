/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api, ctx) {
  if (api.prompts.preset.sfc) {
    return {
      build: {
        chainWebpack (chain) {
          chain.module.rule('jest')
            .test(/\.jest$/)
            .use('jest')
            .loader(require.resolve('./test/loaders/jest-loader.js'))
        }
      }
    }
  }
}
