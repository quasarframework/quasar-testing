module.exports = async function(api) {
  // TODO async handler
  api.registerCommand('test', async ({ args: rawArgs, params: args }) => {
    const execa = require('execa')
    const readline = require('readline')
    const chalk = require('chalk')
    const stripAnsi = require('strip-ansi')
    const fs = require('fs')
    const testingConfigPath = api.resolve.app('quasar.testing.json')
    const testingConfig = fs.existsSync(testingConfigPath)
      ? require(testingConfigPath)
      : {}

    // this is to prevent multiple spawns of e.g. cypress or zap during HMR
    let serviceLock = null

    if ((!args.unit && !args.e2e && !args.security) || args.unit === true || args.e2e === true) {
      console.log(
        chalk`{bgRed  ERROR: } Please specify what test runners to use. e.g. quasar test --unit jest or quasar test --e2e cypress.`
      )
      if (rawArgs.length > 0) {
        console.log(
          chalk`{bgBlue  TIP: } It looks like you are using the old argument syntax (placing "--" before your args). Remove the "--" and the command should work.`
        )
      }
      process.exit(1)
    }

    // Convert string values to arrays

    args.unit = (args.unit || '').split(',')
    args.e2e = (args.e2e || '').split(',')
    args.security = (args.security || '').split(',')

    args.unit.forEach(runner => {
      if (runner === '') {
        args.unit.splice(args.unit.indexOf(runner), 1)
        return
      }
      if (!testingConfig[`unit-${runner.split(' ')[0]}`]) {
        // TODO: install instructions for non-scoped extension
        console.error(
          chalk`You tried to run tests with {bold ${runner}}, but it is not installed. Please install @quasar/quasar-app-extension-unit-${runner} with {bold quasar ext --add @quasar/testing-unit-${runner}}`
        )
        process.exit(1)
      }
    })

    args.e2e.forEach(runner => {
      if (runner === '') {
        args.e2e.splice(args.e2e.indexOf(runner), 1)
        return
      }
      if (!testingConfig[`e2e-${runner.split(' ')[0]}`]) {
        // TODO: install instructions for non-scoped extension
        console.error(
          chalk`You tried to run tests with {bold ${runner}}, but it is not installed. Please install @quasar/quasar-app-extension-e2e-${runner} with {bold quasar ext --add @quasar/testing-e2e-${runner}}`
        )
        process.exit(1)
      }
    })

    args.security.forEach(runner => {
      if (runner === '') {
        args.security.splice(args.security.indexOf(runner), 1)
        return
      }
      if (!testingConfig[`security-${runner.split(' ')[0]}`]) {
        // TODO: install instructions for non-scoped extension
        console.error(
          chalk`You tried to run security tests with {bold ${runner}}, but it is not installed. Please install @quasar/quasar-app-extension-security with {bold quasar ext --add @quasar/testing-security}`
        )
        process.exit(1)
      }
    })

    // If --dev was passed or e2e / security-zap tests are being run
    if (args.dev != null || args.e2e.length > 0 || args.security.includes('zap')) {
      // Start dev server
      // TODO: use interactive output
      if (args.dev === true || typeof args.dev === 'undefined' ) args.dev = 'spa'

      args.dev = args.dev.split(' ')
      const devServer = execa('quasar', ['dev', ...args.dev], {
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
      devServer.stdout.on('data', async rawData => {
        const doneRegex = /App URL\.{11} (https?:\/\/localhost:\d{4}\/)/
        const data = stripAnsi(rawData.toString())
        if (/ERROR {2}Failed to compile with \d* errors/.test(data)) {
          // Dev server errored
          devServer.kill()
          throw new Error('The Quasar dev server failed to start.')
        } else if (doneRegex.test(data)) {
          // Dev server is ready
          // Only ever spawn one instance of zap
          if (serviceLock !== true) {
            await startTests(
              // The dev server url
              data.match(doneRegex)[1],
              killDevServer
            )
          }
        }
      })
    } else {
      // Just run tests without dev server
      await startTests()
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

          // Has the user defined a function to run?
          if (runnerCommandString.startsWith('script:')) {
            const scriptToRun = runnerCommandString.replace('script:', '')
            console.log(chalk` {green app:extension:} Running ${scriptToRun}`)

            try {
              let fn = require(scriptToRun)
              if (typeof fn === 'function') {
                fn(api, resolve)
              } else {
                console.log(chalk`  {bold
                {bgRed Script does not export function.}
                Expecting \`module.exports = (api, resolve) => \{ \}\`
                Skipping test.
                }`)
                resolve()
              }
            } catch (e) {
              console.log(chalk`  {bold
                {bgRed Invalid script defined.}
                Script not found.
                Skipping test.
                }`)
              resolve()
            }
          } else {
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
          }
        })

      for (const runner of args.unit) {
        await runTest(runner, 'unit')
      }
      for (const runner of args.e2e) {
        await runTest(runner, 'e2e')
      }
      for (const runner of args.security) {
        serviceLock = true
        await runTest(runner, 'security')
      }
      failedRunners.forEach(runner => {
        if (!args.security) {
          console.error(
            chalk`{bgRed FAILED TESTS: } Tests with ${runner} did not pass.`
          )
        }
      })
      if (callback) {
        // Exit with code 1 if some tests failed
        callback(failedRunners.length > 0)
      }
    }
  })
}
