/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function(api) {
  api.prompts.options.forEach(val => {
    if (val === 'SFC') {
      api.chainWebpack((chain) => {
        chain.module
          .rule('ava')
          .test(/\.ava$/)
          .use('ava')
          .loader(require.resolve(`${api.appDir}/test/loaders/ava-loader.js`))
      })
    }
  })
}
