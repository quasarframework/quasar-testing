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
	// console.log('api.quasarAppVersion', api.quasarAppVersion)
	// console.log('api.extId', api.extId)
	// console.log('api.appDir', api.appDir)
	// console.log('api.resolve.app(src)', api.resolve.app('/'))

	api.compatibleWithQuasarApp('^1.0.0-alpha.11')

	api.render('./base', {}, true)

	api.prompts.options.forEach((val) => {
		if (val === 'SFC') {
			api.render('./loader', {}, true)
		}
		else if (val === 'scripts') {
			api.extendPackageJson({
				scripts: {
					'test': 'echo \"See package.json => scripts for available tests.\" && exit 0',
					'test:unit': 'ENV=test jest',
					'test:unit:coverage': 'ENV=test jest --coverage',
					'test:unit:watch': 'ENV=test jest --watch',
					'serve:test:coverage': 'quasar serve test/jest/coverage/lcov-report/ --port 8788'
				}
			})
		}
	})
}
