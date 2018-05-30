resolveGlobal = require('resolve-global')


exports.default = function(argv) {

	if (argv.lighthouse || allTests !== false) {
		const lighthouse = resolveGlobal.silent('lighthouse') ? 'lighthouse' : null
		if (lighthouse === null) {
			// Not sure if this is good
			log(`Please install lighthouse globally. It won't run in this mode otherwise.
      $ yarn global add lighthouse      
    `)
			process.exit(0)
		} else {
			const url = !argv.url ? 'http://localhost:8080' : argv.url // todo: better method
			const config = !argv.config ? './test/quality/configs/full-config.js' : argv.config // todo: better method
			log(`Starting Lighthouse testing.`)
			const outputPath = !argv.outputpath ? './test/quality/reports/' : argv.outputpath // todo: better method
			const view = !argv.view ? '' : '--view' // todo: better method
			const now = !argv.yes ? '-' + Math.floor((new Date).getTime() / 1000) : ''
			spawn.sync(lighthouse,
				[url, view, `--output-path=${outputPath}lighthouse-results${now}.html`, `--config-path=${config}`])
		}
	}

	if (argv.quality) {
		// todo: check for VALID types
		const testurl = !argv.url ? 'http://localhost:8080' : argv.url // todo: better method
		const options = !argv.options ? {
			chromeFlags: ['--show-paint-rects']
		} : argv.options // todo: better method
		const quality = !argv.quality ? 'full' : argv.quality
		const Performance = require(appPaths.testDir + '/quality/lighthouse-runner')
		const config = !argv.config ? './test/quality/configs/full-config.js' : argv.config // todo: better method
		const configPath = require(config)
		Performance.launchChromeAndRunLighthouse(testurl, options, configPath).then(results => {
			console.log(JSON.stringify(results))
		})
	}
}

