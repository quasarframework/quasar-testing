const fs = require('fs-extra')
let extend

/**
 * The .babelrc file has been created to assist AVA for transpiling.
 * You should keep your application's babel rules in this file.
 */
if (fs.existsSync('./.babelrc')) {
  extend = './.babelrc'
}

const plugins = []
if (process.env.QUASAR_APP_TEST) {
  // Add aliases if testing
  plugins.push([
    'module-resolver',
    {
      root: ['./'],
      alias: {
        quasar: './node_modules/quasar/dist/quasar.umd.js',
        'test-utils': '@vue/test-utils',
        '~': './'
      }
    }
  ])
}

const presets = []
if (!process.env.QUASAR_APP_TEST) {
  // Add quasar preset if not testing
  presets.push(['@quasar/babel-preset-app'])
}

module.exports = {
  plugins,
  presets,
  extends: extend
}
