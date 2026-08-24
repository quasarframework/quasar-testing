/**
 * Quasar App Extension install script
 * https://quasar.dev/app-extensions/development-guide/install-api
 */

const { appendFileSync } = require('fs');
const { join } = require('path');
const { enforcedDevServerPort } = require('./shared');

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 * based on https://stackoverflow.com/a/49798508
 *
 * @param {...object} sources - Objects to merge
 * @returns {object} New object with merged key/values
 */
function __mergeDeep(...sources) {
  let result = {};
  for (const source of sources) {
    if (source instanceof Array) {
      if (!(result instanceof Array)) {
        result = [];
      }
      result = [...result, ...source];
    } else if (source instanceof Object) {
      // eslint-disable-next-line prefer-const
      for (let [key, value] of Object.entries(source)) {
        if (value instanceof Object && key in result) {
          value = __mergeDeep(result[key], value);
        }
        result = { ...result, [key]: value };
      }
    }
  }
  return result;
}

// We use devDependencies instead of peerDependencies because devDependencies are usually the latest version
// and peerDependencies could contain a string supporting multiple major versions (e.g. "cypress": "^12.2.0 || ^13.1.0")
const { devDependencies: aeDevDependencies } = require(
  join(__dirname, '..', 'package.json'),
);

function getCompatibleDevDependencies(packageNames) {
  const devDependencies = {};

  for (const packageName of packageNames) {
    devDependencies[packageName] = aeDevDependencies[packageName];
  }

  return devDependencies;
}

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.24.0');
  api.compatibleWith('@quasar/app-vite', '^3.0.0');

  const devServerPort = api.prompts.port ?? enforcedDevServerPort;
  const shouldSupportTypeScript = await api.hasTypescript();
  const shouldAddCodeCoverage = api.prompts.options.includes('code-coverage');
  const testEnvCommand = 'cross-env NODE_ENV=test';
  // "http-get" must be used because the underlying "wait-on" performs HEAD requests by default
  // On some OSes "localhost" resolves to "::1" instead of "127.0.0.1", so use the IP explicitly
  // See https://github.com/bahmutov/start-server-and-test/issues/358
  const e2eServerCommand = `${testEnvCommand} start-test "quasar dev" http-get://127.0.0.1:${devServerPort}`;
  const e2eCommand = `${e2eServerCommand} "cypress open --e2e"`;
  const e2eCommandCi = `${e2eServerCommand} "cypress run --e2e"`;
  const componentCommand = `${testEnvCommand} cypress open --component`;
  const componentCommandCi = `${testEnvCommand} cypress run --component`;

  api.render('./templates/base', { shouldSupportTypeScript });

  api.render(`./templates/${shouldSupportTypeScript ? '' : 'no-'}typescript`, {
    devServerPort,
    shouldAddCodeCoverage,
    shouldSupportTypeScriptAndVite: shouldSupportTypeScript,
    // See https://github.com/quasarframework/quasar-testing/issues/379
    requiresPublicPath: true,
  });

  // eslint-plugin-cypress v7 requires ESLint v10
  const shouldAddEslintPlugin = api.hasPackage('eslint', '>=10');

  api.extendPackageJson(
    __mergeDeep(
      {
        devDependencies: getCompatibleDevDependencies([
          'cypress',
          ...(shouldAddEslintPlugin ? ['eslint-plugin-cypress'] : []),
        ]),
      },
      {
        scripts: {
          test: 'echo "See package.json => scripts for available tests." && exit 0',
          'test:e2e': e2eCommand,
          'test:e2e:ci': e2eCommandCi,
          'test:component': componentCommand,
          'test:component:ci': componentCommandCi,
        },
      },
    ),
  );

  if (shouldAddCodeCoverage) {
    api.render('./templates/code-coverage');

    const gitignorePath = api.resolve.app('.gitignore');
    appendFileSync(gitignorePath, '\n.nyc_output\ncoverage/\n');
  }

  // app-vite v3 dropped the v2 hasLint() helper.
  if (api.hasPackage('eslint')) {
    api.onExitLog(
      'Check out https://github.com/quasarframework/quasar-testing/tree/dev/packages/e2e-cypress to see how to add proper Cypress linting configuration to your project.',
    );
  }
};
