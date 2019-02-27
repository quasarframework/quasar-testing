/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 *  $ quasar ext --add @quasar/testing-unit-jest --skip-pkg
 *  '@quasar/quasar-app-extension-testing-unit-jest': 'link:../packages/unit-jest',
 *
 */

module.exports = function (api) {
  api.render('./base', {}, true)

  api.extendJsonFile('quasar.testing.json', {
    'unit-jest': {
      runnerCommand: 'jest'
    }
  })

	api.prompts.options.forEach((val) => {
		if (val === 'SFC') {
			api.render('./loader', {}, true)
		}
		else if (val === 'scripts') {
			api.extendPackageJson({
				scripts: {
					'test': 'echo \"See package.json => scripts for available tests.\" && exit 0',
					'test:unit': 'jest --updateSnapshot',
					'test:unit:coverage': 'jest --coverage',
					'test:unit:watch': 'jest --watch',
					'test:unit:watchAll': 'jest --watchAll',
					'serve:test:coverage': 'quasar serve test/jest/coverage/lcov-report/ --port 8788',
					'concurrently:dev:jest': 'concurrently -p \"[{name}]\" -n \"QUASAR,_JEST_\" -c \"quasar dev\" \"jest --watch\"'
				}
			})
		}
	})
	if (api.prompts.babel) {
		api.render(`./${api.prompts.babel}`, {}, true)
	}
}
