/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 */

module.exports = function (api) {
  api.render('./base')
  api.prompts.options.forEach((val) => {
    if (val === 'scripts') {
      api.extendPackageJson({
        scripts: {
        }
      })
    }
  })
}
