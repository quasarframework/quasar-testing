module.exports = function(api, ctx) {
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

  api.registerCommand('test', ({ args: rawArgs, params }) => {
    const execa = require('execa')
    const readline = require('readline')
    const yargs = require('yargs')
    const chalk = require('chalk')
    const stripAnsi = require('strip-ansi')

    const args = yargs.array('unit').parse(rawArgs)
    if (!args.unit) {
      console.log(
        chalk`{bgRed  ERROR: } Please say what test runners to use with the --unit argument.`
      )
      process.exit(1)
    }

    // TODO: support e2e
    args.unit.forEach(runner => {
      if (
        !api.hasExtension(`@quasar/unit-${runner}`) &&
        !api.hasExtension(`unit-${runner}`)
      ) {
        // TODO: install instructions for non-scoped extension
        console.error(
          chalk`You tried to run tests with {bold ${runner}}, but it is not installed. Please install @quasar/quasar-app-extension-unit-${runner} with {bold quasar ext --add @quasar/unit-${runner}}`
        )
        process.exit(1)
      }
    })

    // If --dev was passed
    if (args.dev) {
      // Start dev server
      // TODO: use interactive output
      const devServer = execa('quasar', ['dev'], {
        cwd: api.resolve.app('.'),
        env: { FORCE_COLOR: true }
      })
      devServer
      devServer.catch(e => {
        // Throw error if it wasn't killed manually
        if (!e.killed) throw new Error(e)
      })

      const killDevServer = hasFailed => {
        if (!devServer) {
          process.exit(hasFailed ? 1 : 0)
        }

        devServer.kill()
      }

      // Kill dev server on exit
      process.on('SIGINT', killDevServer)
      process.on('SIGTERM', killDevServer)

      // Handle Ctrl+C on Windows
      if (process.platform === 'win32') {
        readline
          .createInterface({
            input: process.stdin,
            output: process.stdout
          })
          .on('SIGINT', () => {
            process.emit('SIGINT')
          })
      }

      // Pipe output to console
      devServer.stdout.pipe(process.stdout)
      devServer.stdout.on('data', rawData => {
        const data = stripAnsi(rawData.toString())
        if (/ERROR {2}Failed to compile with \d* errors/.test(data)) {
          // Dev server errored
          devServer.kill()
          throw new Error('The Quasar dev server failed to start.')
        } else if (/DONE {2}Compiled successfully in \d*ms/.test(data)) {
          // Dev server is ready
          startTest(killDevServer)
        }
      })
    } else {
      // Just run tests without dev server
      startTest()
    }

    async function startTest(callback) {
      let failedRunners = []
      const runTest = runner =>
        new Promise((resolve, reject) => {
          console.log(
            chalk`
              {bold \n{bgBlue  RUN: } Running tests with ${runner}\n}
            `
          )
          const testRunner = execa(runner, { stdio: 'inherit' })
          testRunner.on('exit', code => {
            if (code !== 0) {
              failedRunners.push(runner)
            }
            resolve()
          })
        })

      for (const runner of args.unit) {
        await runTest(runner)
      }
      failedRunners.forEach(runner => {
        console.error(
          chalk`{bgRed FAILED TESTS: } Tests with ${runner} did not pass.`
        )
      })
      if (callback) {
        // Exit with code 1 if some tests failed
        callback(failedRunners.length > 0)
      }
    }
  })

  api.beforeDevStart(() => {
    console.log('before dev kicks in')
  })
}
