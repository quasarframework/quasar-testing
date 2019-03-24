/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */

module.exports = function (api) {
  api.render('./base')

  api.extendJsonFile('quasar.testing.json', {
    'e2e-wdio': {
      runnerCommand: 'wdio ./test/webdriver/config/wdio.conf.js'
    },
    'e2e-wdio-appium': {
      runnerCommand: 'wdio ./test/webdriver/config/wdio.appium.conf.js'
    },
    'e2e-wdio-electron': {
      runnerCommand: 'wdio ./test/webdriver/config/wdio.electron.conf.js'
    }
  })

  api.prompts.options.forEach((val) => {
    if (val === 'scripts') {
      api.extendPackageJson({
        scripts: {
          "test:e2e": "wdio ./test/webdriver/config/wdio.conf.js",
          "test:e2e:appium": "wdio ./test/webdriver/config/wdio.appium.conf.js",
          "test:e2e:electron": "wdio ./test/webdriver/config/wdio.electron.conf.js",
          "selenium:install": "selenium-standalone install",
          "selenium:start": "selenium-standalone start",
          "electron-chromedriver": "./node_modules/electron-chromedriver/bin/chromedriver --port=9515 --url-base=wd/hub --verbose"
        }
      })
    }
  })
}
