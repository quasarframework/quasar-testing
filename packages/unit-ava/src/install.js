/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 *  $ quasar ext --add @quasar/testing-unit-ava --skip-pkg
 *  '@quasar/quasar-app-extension-testing-unit-ava': 'link:../packages/unit-ava',
 *
 */

module.exports = function(api) {
  api.render('./base', {}, true)

  api.extendJsonFile('quasar.testing.json', {
    'unit-ava': {
      runnerCommand: 'ava'
    }
  })

  api.prompts.options.forEach(val => {
    if (val === 'SFC') {
      api.render('./loader')
    } else if (val === 'wallabyjs') {
      api.render('./wallabyjs')
      api.extendPackageJson('./wallabyjs/.package.json')
    } else if (val === 'scripts') {
      api.extendPackageJson({
        scripts: {
          'test:unit': 'ava'
        }
      })
    }
  })
  if (api.prompts.babel) {
    api.render(`./${api.prompts.babel}`)
  }
}
