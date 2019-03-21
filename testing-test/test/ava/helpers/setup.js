// Setup browser environment
require('jsdom-global')(undefined, {
  url: 'http://localhost'
})
// https://github.com/vuejs/vue-cli/issues/2128
window.Date = Date
// https://github.com/vuejs/vue/issues/9698
global.performance = window.performance
const hooks = require('require-extension-hooks')
const Vue = require('vue')

// Setup Vue.js to remove production tip
Vue.config.productionTip = false

// Setup vue files to be processed by `require-extension-hooks-vue`
hooks('vue')
  .plugin('vue')
  .push()
// Setup vue and js files to be processed by `require-extension-hooks-babel`
hooks(['vue', 'js'])
  .exclude(({ filename }) => filename.match(/\/node_modules\//))
  .plugin('babel')
  .push()

// Notify babel config of test
process.env.QUASAR_APP_TEST = true

// Error if console.log is called
// console.log = () => {
//  throw new Error('Do not use console.log() in production')
// }
