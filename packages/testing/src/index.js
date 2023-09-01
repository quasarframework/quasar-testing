const testTypesWithRunner = ['unit', 'component', 'e2e'];
const testTypes = [...testTypesWithRunner, 'security'];

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.0.0');

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0 || ^2.0.0-alpha.27');
  } else if (api.hasWebpack) {
    // TODO: should be "@quasar/app-webpack" but that is not backward compatible
    // Remove when Qv3 comes out, or when "@quasar/app" is officially deprecated
    api.compatibleWith('@quasar/app', '^3.0.0 || ^4.0.0-alpha.20');
  }

  // TODO async handler
  api.registerCommand('test', async ({ args: rawArgs, params: args }) => {
    const execa = require('execa');
    const readline = require('readline');
    const chalk = require('chalk');
    const stripAnsi = require('strip-ansi');
    const fs = require('fs');
    const testingConfigPath = api.resolve.app('quasar.testing.json');
    const testingConfig = fs.existsSync(testingConfigPath)
      ? require(testingConfigPath)
      : {};

    // this is to prevent multiple spawns of e.g. cypress or zap during HMR
    let serviceLock = null;

    if (
      testTypes.every((type) => !args[type]) ||
      testTypesWithRunner.some((type) => args[type] === true)
    ) {
      console.log(
        chalk`{bgRed  ERROR: } Please specify what test runners to use. e.g. quasar test --unit jest or quasar test --component cypress or quasar test --e2e cypress.`,
      );
      if (rawArgs.length > 0) {
        console.log(
          chalk`{bgBlue  TIP: } It looks like you are using the old argument syntax (placing "--" before your args). Remove the "--" and the command should work.`,
        );
      }
      process.exit(1);
    }

    // Convert string values to arrays

    for (const testType of testTypes) {
      args[testType] = (args[testType] || '').split(',');

      args[testType].forEach((runner) => {
        if (runner === '') {
          args[testType].splice(args.unit.indexOf(runner), 1);
          return;
        }
        if (!testingConfig[`${testType}-${runner.split(' ')[0]}`]) {
          const testAeName = `${testType}${
            testTypesWithRunner.includes(testType) ? `-${runner}` : ''
          }`;

          // TODO: install instructions for non-scoped extension
          console.error(
            chalk`You tried to run tests with {bold ${runner}}, but it is not installed. Please install @quasar/quasar-app-extension-${testAeName} with {bold quasar ext add @quasar/testing-${testAeName}}`,
          );
          process.exit(1);
        }
      });
    }

    const killProcess = (hasFailed) => {
      process.exit(hasFailed ? 1 : 0);
    };

    // If --dev was passed or security-zap tests are being run
    // Cypress already spawns it's dev server
    // TODO: use start-test for all harnesses needing quasar devServer running?
    if (
      (args.dev !== null && args.dev !== undefined) ||
      args.security.includes('zap')
    ) {
      // Start dev server
      // TODO: use interactive output
      if (args.dev === true || typeof args.dev === 'undefined') {
        args.dev = 'spa';
      }

      args.dev = args.dev.split(' ');
      const devServer = execa('quasar', ['dev', ...args.dev], {
        cwd: api.resolve.app('.'),
        env: { FORCE_COLOR: true },
      });
      devServer.catch((e) => {
        // Throw error if it wasn't killed manually
        if (!e.killed) {
          throw new Error(e);
        }
      });

      const killDevServer = (hasFailed) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (devServer) {
          devServer.kill();
        }

        killProcess(hasFailed);
      };

      // Kill dev server on exit
      process.on('SIGINT', killDevServer);
      process.on('SIGTERM', killDevServer);

      // Handle Ctrl+C on Windows
      if (process.platform === 'win32') {
        readline
          .createInterface({
            input: process.stdin,
            output: process.stdout,
          })
          .on('SIGINT', () => {
            process.emit('SIGINT');
          });
      }

      const doneRegex = /App URL\.{11,} (https?:\/\/localhost:\d{4}\/)/;

      // Pipe output to console
      devServer.stdout.pipe(process.stdout);
      devServer.stdout.on('data', async (rawData) => {
        const data = stripAnsi(rawData.toString());
        if (/ERROR {2}Failed to compile with \d* errors/.test(data)) {
          // Dev server errored
          devServer.kill();
          throw new Error('The Quasar dev server failed to start.');
        } else if (doneRegex.test(data)) {
          // Dev server is ready
          // Only ever spawn one instance of zap
          if (serviceLock !== true) {
            await startTests(
              // The dev server url
              data.match(doneRegex)[1],
              killDevServer,
            );
          }
        }
      });
    } else {
      // Just run tests without dev server
      await startTests(undefined, killProcess);
    }

    async function startTests(serverUrl, callback) {
      const failedRunners = [];
      const runTest = (userCommand, type) =>
        new Promise((resolve) => {
          // Split runner command into command and arguments
          const runner = userCommand.split(' ')[0];
          const userArgs = userCommand.split(' ').slice(1);

          console.log(
            chalk`
              {bold \n{bgBlue  RUN: } Running ${type} tests with ${runner}\n}
            `,
          );
          const { runnerCommand: runnerCommandString } =
            testingConfig[`${type}-${runner}`] || runner;

          // Has the user defined a function to run?
          if (runnerCommandString.startsWith('script:')) {
            const scriptToRun = runnerCommandString.replace('script:', '');
            console.log(chalk` {green app:extension:} Running ${scriptToRun}`);

            try {
              const fn = require(scriptToRun);
              if (typeof fn === 'function') {
                fn(api, resolve);
              } else {
                console.log(chalk`  {bold
                {bgRed Script does not export function.}
                Expecting \`module.exports = (api, resolve) => \{ \}\`
                Skipping test.
                }`);
                resolve();
              }
            } catch (e) {
              console.log(chalk`  {bold
                {bgRed Invalid script defined.}
                Script not found.
                Skipping test.
                }`);
              resolve();
            }
          } else {
            // Compose a classic shell command and run it through execa.command
            // This is done because parsing arguments containing spaces
            //  and enclosed with escaped quotes (eg `--myArg \"My arg\"`)
            //  is a major pain point
            const runnerCommand =
              runnerCommandString.replace('${serverUrl}', serverUrl) +
              userArgs.join(' ');
            console.log('$', runnerCommand);
            const testRunner = execa.command(runnerCommand, {
              stdio: 'inherit',
              shell: true,
              preferLocal: true,
            });
            testRunner.on('exit', (code) => {
              if (code !== 0) {
                failedRunners.push(runner);
              }
              resolve();
            });
          }
        });

      for (const testType of testTypes) {
        for (const runner of args[testType]) {
          if (testType === 'security') {
            serviceLock = true;
          }

          await runTest(runner, testType);
        }
      }

      failedRunners.forEach((runner) => {
        if (!args.security) {
          console.error(
            chalk`{bgRed FAILED TESTS: } Tests with ${runner} did not pass.`,
          );
        }
      });

      callback(failedRunners.length > 0);
    }
  });
};
