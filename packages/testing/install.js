/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 */

const execa = require('execa')

module.exports = async function(api) {
  api.compatibleWithQuasarApp('^1.0.0-alpha.12')

  api.render('./base', {}, true)

  for (const harness of api.prompts.harnesses) {
    try {
      await execa(
        'quasar',
        [
          'ext',
          '--add',
          `@quasar/${harness}`,
          process.argv.indexOf('--skip-pkg') > -1 ? '--skip-pkg' : ''
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
