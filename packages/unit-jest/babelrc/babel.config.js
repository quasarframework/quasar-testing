const fs = require('fs-extra')
let extend = undefined

if (fs.existsSync('./.babelrc')) {
  extend = './.babelrc'
}

module.exports = {
  presets: [
    '@quasar/babel-preset-app'
  ],
  extends: extend
}
