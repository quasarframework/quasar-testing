/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */

module.exports = function (api) {
  api.extendJsonFile('quasar.testing.json', {
    'security-antivuln': {
      runnerCommand: 'script:../../security-antivuln/src/runner.js'
    }
  })
}
