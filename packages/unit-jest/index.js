/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api, ctx) {
	api.extendQuasarConf(conf => {
		console.log('extendQuasarConf')
		console.log('  conf', conf !== void 0)
		console.log('conf.css', conf.css)
		// conf.boot.push('my-boot')
	})

	console.log('api.quasarAppVersion', api.quasarAppVersion)

	if (api.prompts.preset.sfc) {
		api.chainWebpack((chain, invoke) => {
			console.log('chainWebpack called')
			console.log('  chain', chain !== void 0)
			console.log('  invoke', invoke)
			chain.module.rule('jest')
				.test(/\.jest$/)
				.use('jest')
				.loader(require.resolve('./test/loaders/jest-loader.js'))
		})
	}
}
