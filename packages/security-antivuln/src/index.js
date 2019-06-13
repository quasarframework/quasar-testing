/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

const AntiVuln = require('./AntiVuln')

module.exports = async function (api) {
  try {
    const antiVuln = new AntiVuln(api)
    if (
      (api.ctx.dev && api.prompts.options.includes('runOnDev')) ||
      (api.ctx.prod && api.prompts.options.includes('runOnBuild'))
    ) {
      let result = await antiVuln.run()
      if (result !== void 0) {
        if (api.prompts.options.includes('strict')) {
          console.log('Bad dependencies found; exiting.')
          process.exit(0)
        }
      }
    }
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}
