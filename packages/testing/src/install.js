/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 */

module.exports = async function(api) {
  const execa = require('execa')

  api.render('./base')

  const addOrInvoke = process.argv.indexOf('invoke') > -1 ? 'invoke' : 'add'

  for (const harness of api.prompts.harnesses) {
    try {
      const code = await execa(
        'quasar',
        [
          'ext',
          addOrInvoke,
          `@quasar/testing-${harness}`
        ],
        {
          stdio: 'inherit',
          cwd: api.resolve.app('.')
        }
      )
      if (code.code !== 0) {
        console.error(`Extension ${harness} failed to install.`)
        if (addOrInvoke === 'invoke') console.log('Extra debug:\n', code)
        process.exit(1)
      }
    } catch (e) {
      console.error(`Extension ${harness} failed to install:`, e)
    }
  }
}
