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
		conf.extendBabel.push({
			env: {
				test: {
					presets: [
						["@babel/preset-env",
							{
								"modules": "commonjs",
								"targets": {
									"node": "current"
								}
							}
						]
					]
				}
			}
		})
	})

	console.log('api.quasarAppVersion', api)
	if (api.prompts.options)
	api.chainWebpack((chain, invoke) => {
		chain.module.rule('jest')
			.test(/\.jest$/)
			.use('jest')
			.loader(require.resolve(`${api.appDir}/test/loaders/jest-loader.js`))
	})
}
