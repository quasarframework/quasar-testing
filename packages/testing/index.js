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
    const fs = require('fs')
    const testingConfigPath = api.resolve.app('quasar.testing.json')
    const testingConfig = fs.existsSync(testingConfigPath)
      ? require(testingConfigPath)
      : {}

    const args = yargs
      .array('unit')
      .array('e2e')
      .string('dev')
      .parse(rawArgs)
    if (!args.unit && !args.e2e) {
      console.log(
        chalk`{bgRed  ERROR: } Please say what test runners to use with the --unit or --e2e argument.`
      )
      process.exit(1)
    }

    // Fill in missing values
    args.unit = args.unit || []
    args.e2e = args.e2e || []

    args.unit.forEach(runner => {
      if (!testingConfig[`unit-${runner.split(' ')[0]}`]) {
        // TODO: install instructions for non-scoped extension
        console.error(
          chalk`You tried to run tests with {bold ${runner}}, but it is not installed. Please install @quasar/quasar-app-extension-unit-${runner} with {bold quasar ext --add @quasar/unit-${runner}}`
        )
        process.exit(1)
      }
    })

    args.e2e.forEach(runner => {
      if (!testingConfig[`e2e-${runner.split(' ')[0]}`]) {
        // TODO: install instructions for non-scoped extension
        console.error(
          chalk`You tried to run tests with {bold ${runner}}, but it is not installed. Please install @quasar/quasar-app-extension-e2e-${runner} with {bold quasar ext --add @quasar/e2e-${runner}}`
        )
        process.exit(1)
      }
    })

    // If --dev was passed or e2e tests are being run
    if (args.dev != null || args.e2e.length > 0) {
      // Start dev server
      // TODO: use interactive output
      const devServerArgs = (args.dev || '').split(' ')
      const devServer = execa('quasar', ['dev', ...devServerArgs], {
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
        const doneRegex = /App URL\.{11} (https?:\/\/localhost:\d{4}\/)/
        const data = stripAnsi(rawData.toString())
        if (/ERROR {2}Failed to compile with \d* errors/.test(data)) {
          // Dev server errored
          devServer.kill()
          throw new Error('The Quasar dev server failed to start.')
        } else if (doneRegex.test(data)) {
          // Dev server is ready
          startTests(
            // The dev server url
            data.match(doneRegex)[1],
            killDevServer
          )
        }
      })
    } else {
      // Just run tests without dev server
      startTests()
    }

    async function startTests(serverUrl, callback) {
      let failedRunners = []
      const runTest = (userCommand, type) =>
        new Promise(resolve => {
          // Split runner command into command and arguments
          const runner = userCommand.split(' ')[0]
          const userArgs = userCommand.split(' ').slice(1)

          console.log(
            chalk`
              {bold \n{bgBlue  RUN: } Running ${type} tests with ${runner}\n}
            `
          )
          const { runnerCommand: runnerCommandString } =
            testingConfig[`${type}-${runner}`] || runner
          const runnerCommandArgs = runnerCommandString
            // Set server url
            .replace('${serverUrl}', serverUrl)
            .split(' ')
          // Remove first arg, that is the command
          const runnerCommand = runnerCommandArgs.shift()
          // Mix user args and runner args
          const finalArgs = [...runnerCommandArgs, ...userArgs]
          console.log('$', runner, finalArgs.join(' '))
          const testRunner = execa(runnerCommand, finalArgs, {
            stdio: 'inherit'
          })
          testRunner.on('exit', code => {
            if (code !== 0) {
              failedRunners.push(runner)
            }
            resolve()
          })
        })

      for (const runner of args.unit) {
        await runTest(runner, 'unit')
      }
      for (const runner of args.e2e) {
        await runTest(runner, 'e2e')
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
