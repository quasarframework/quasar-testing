/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 *  $ quasar ext --add @quasar/testing-unit-jest --skip-pkg
 *  "@quasar/quasar-app-extension-testing-unit-jest": "link:../packages/unit-jest",
 *
 */

module.exports = function (api) {
	console.log('api.quasarAppVersion', api.quasarAppVersion)
	console.log('api.extId', api.extId)
	console.log('api.appDir', api.appDir)
	console.log('api.resolve.app(src)', api.resolve.app('/'))

	api.compatibleWithQuasarApp('1.0.0-alpha.10')

	api.prompts.runners.forEach((val) => {
		if (val === 'JEST') {
			console.log('!!!!!!!!!!!!!!!!!!!!!!!!!! JEST')
			api.render('./jest2')
		}
	})
}
