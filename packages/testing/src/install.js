/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 */

module.exports = async function(api) {
  const execa = require('execa')

  api.render('./base', {}, true)

  for (const harness of api.prompts.harnesses) {
    try {
      await execa(
        'quasar',
        [
          'ext',
          process.argv.indexOf('invoke') > -1 ? 'invoke' : 'add',
          `@quasar/testing-${harness}`
        ],
        {
          stdio: 'inherit',
          cwd: api.resolve.app('.')
        }
      )
    } catch (e) {
      console.error(`Extension ${harness} failed to install:`, e)
    }
  }
}
