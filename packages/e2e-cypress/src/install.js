/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
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

// make sure the object exists
let extendPackageJson = {
  devDependencies: getCompatibleDevDependencies(['cypress']),
};

// TODO: remove this and roll back to use `getCompatibleDevDependencies` for next Cypress AE major version,
// which will drop support for ESLint v8 and require a migration of this monorepo to ESLint v9
function getEslintPluginCypressDependency(api) {
  return {
    devDependencies: {
      // eslint-plugin-cypress v3 doesn't support ESLint v9 and eslint-plugin-cypress v4 only supports ESLint v9,
      // So if the user has ESLint v9 installed, then we will scaffold with eslint-plugin-cypress v4, otherwise we will use v3
      'eslint-plugin-cypress': api.hasPackage('eslint', '^9.0.0')
        ? '^4.2.1'
        : '^3.6.0',
    },
  };
}

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.0.0');
  if (api.hasVite) {
    // PromptsAPI and hasTypescript are only available from v1.6.0 onwards
    api.compatibleWith('@quasar/app-vite', '^v1.6.0 || ^2.0.0');
  } else if (api.hasWebpack) {
    // PromptsAPI and hasTypescript are only available from v3.11.0 onwards
    api.compatibleWith('@quasar/app-webpack', '^3.11.0 || ^4.0.0');
  }

  const devServerPort = api.prompts.port ?? enforcedDevServerPort;
  const shouldSupportTypeScript = await api.hasTypescript();
  const shouldAddCodeCoverage =
    api.prompts.options.includes('code-coverage') && api.hasVite;
  const shouldUpdateModuleResolution =
    api.hasPackage('typescript', '^5.0.0') &&
    (api.hasPackage('@quasar/app-vite', '^2.0.0') ||
      api.hasPackage('@quasar/app-webpack', '^4.0.0'));
  // TODO: We are setting the TS_NODE_PROJECT to ensure the test/cypress/tsconfig.json is used. This is needed as a workaround for
  // module resolution issues with Cypress and Typescript >=5. Once the issue is resolved we can remove this TS_NODE_PROJECT flag
  // See https://github.com/quasarframework/quasar/discussions/16877#discussioncomment-11434734
  const testEnvCommand =
    `cross-env NODE_ENV=test` +
    (shouldUpdateModuleResolution
      ? ' TS_NODE_PROJECT=test/cypress/tsconfig.json'
      : '');
  // "http-get" must be used because "webpack-dev-server" won't answer
  //  HEAD requests which are performed by default by the underlying "wait-on"
  // See https://github.com/bahmutov/start-server-and-test#note-for-webpack-dev-server-users
  // On Node 17, 18 and 19, "localhost" could resolve to "::1" instead of "127.0.0.1" depending on the OS
  // Mac and Windows will, Linux will stick to the old behaviour
  // That's why we had to upgrade the script to explicitly use "127.0.0.1" instead
  // See https://github.com/nodejs/node/issues/40537
  // See https://github.com/jeffbski/wait-on/issues/137
  // See https://github.com/jeffbski/wait-on/issues/109
  // See https://github.com/bahmutov/start-server-and-test/issues/358
  // See https://vitejs.dev/config/server-options.html#server-host
  // TODO: AFAIK latest version of Node 20 implements "Happy Eyeball" protocol which will try both IPv6 and IPv4,
  // thus we should be able to revert to use "localhost" once we remove support for Node 18 in the next major version
  // See https://github.com/electron/electron/issues/37044
  // See https://github.com/jeffbski/wait-on/issues/109#issuecomment-1344097583
  const e2eServerCommand = `${testEnvCommand} start-test "quasar dev" http-get://127.0.0.1:${devServerPort}`;
  const e2eCommand = `${e2eServerCommand} "cypress open --e2e"`;
  const e2eCommandCi = `${e2eServerCommand} "cypress run --e2e"`;
  const componentCommand = `${testEnvCommand} cypress open --component`;
  const componentCommandCi = `${testEnvCommand} cypress run --component`;

  api.render('./templates/base', { shouldSupportTypeScript });

  api.render(`./templates/${shouldSupportTypeScript ? '' : 'no-'}typescript`, {
    devServerPort,
    shouldAddCodeCoverage,
    shouldSupportTypeScriptAndVite: shouldSupportTypeScript && api.hasVite,
    shouldUpdateModuleResolution,
    // See https://github.com/quasarframework/quasar-testing/issues/379
    requiresPublicPath: api.hasVite && api.hasPackage('@quasar/app-vite', '^2.0.0-0')
  });

  const scripts = {
    scripts: {
      test: 'echo "See package.json => scripts for available tests." && exit 0',
      'test:e2e': e2eCommand,
      'test:e2e:ci': e2eCommandCi,
      'test:component': componentCommand,
      'test:component:ci': componentCommandCi,
    },
  };
  extendPackageJson = __mergeDeep(extendPackageJson, scripts);
  extendPackageJson = __mergeDeep(
    extendPackageJson,
    getEslintPluginCypressDependency(api),
  );
  api.extendPackageJson(extendPackageJson);

  if (shouldAddCodeCoverage) {
    api.render('./templates/code-coverage');

    const gitignorePath = api.resolve.app('.gitignore');
    appendFileSync(gitignorePath, '\n.nyc_output\ncoverage/\n');
  }

  if (api.prompts.options.includes('code-coverage') && api.hasWebpack) {
    api.onExitLog(
      "Code coverage isn't supported for Webpack yet. Please use Vite CLI instead.",
    );
  }

  if (await api.hasLint()) {
    api.onExitLog(
      'Check out https://github.com/quasarframework/quasar-testing/tree/dev/packages/e2e-cypress to see how to add proper Cypress linting configuration to your project.',
    );
  }
};
