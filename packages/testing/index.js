module.exports = function (api, ctx) {
	console.log('api.quasarAppVersion', api.quasarAppVersion)
	/*
	console.log('api.ctx', api.ctx)
	console.log('ctx', ctx)
	console.log('api.extId', api.extId)
	console.log('api.appDir', api.appDir)
	console.log('api.resolve.app(src)', api.resolve.app('src'))
	console.log('api.hasExtension(api.extId)', api.hasExtension(api.extId))
	console.log('api.hasExtension(bogus)', api.hasExtension('bogus'))
	console.log('api.prompts', api.prompts)
	*/

	// api.compatibleWithQuasarApp('1.0.0')

	api.extendQuasarConf(conf => {
		console.log('extendQuasarConf')
		console.log('  conf', conf !== void 0)
		console.log('conf.css', conf.css)
		// conf.boot.push('my-boot')
	})

	api.registerCommand('test', ({ args, params }) => {
		console.log('Beep command called')
		console.log('args', args)
		console.log('params', params)
	})

	api.beforeDevStart(() => {
		console.log('before dev kicks in')
	})
}
