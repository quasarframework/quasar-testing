/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */

const { appendFileSync } = require('fs');

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

// make sure the object exists
let extendPackageJson = {
  devDependencies: {
    'eslint-plugin-cypress': '^2.11.3',
  },
};

module.exports = function (api) {
  const devServerPort = api.hasVite ? 9000 : 8080;
  const shouldAddScripts = api.prompts.options.includes('scripts');
  const shouldSupportTypeScript = api.prompts.options.includes('typescript');
  const shouldAddCodeCoverage =
    api.prompts.options.includes('code-coverage') && api.hasVite;

  const testEnvCommand = `cross-env NODE_ENV=test`;
  // "http-get" must be used because "webpack-dev-server" won't answer
  //  HEAD requests which are performed by default by the underlying "wait-on"
  // See https://github.com/bahmutov/start-server-and-test#note-for-webpack-dev-server-users
  const e2eServerCommand = `${testEnvCommand} start-test "quasar dev" http-get://localhost:${devServerPort}`;
  const e2eCommand = `${e2eServerCommand} "cypress open"`;
  const e2eCommandCi = `${e2eServerCommand} "cypress run"`;
  const componentCommand = `${testEnvCommand} cypress open --component`;
  const componentCommandCi = `${testEnvCommand} cypress run --component`;

  api.render('./templates/base');

  api.render(`./templates/${shouldSupportTypeScript ? '' : 'no-'}typescript`, {
    devServerPort,
    shouldAddCodeCoverage,
  });

  api.extendJsonFile('quasar.testing.json', {
    'e2e-cypress': {
      runnerCommand: e2eCommandCi,
    },
    'component-cypress': {
      runnerCommand: componentCommandCi,
    },
  });

  if (shouldAddScripts) {
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
  }

  if (shouldAddCodeCoverage) {
    api.render('./templates/code-coverage');

    const gitignorePath = api.resolve.app('.gitignore');
    appendFileSync(gitignorePath, '\n.nyc_output\ncoverage/\n');
  }

  // TODO: using `api.hasWebpack` won't be available if the user is still using
  // the old app, so we check hasVite instead
  if (api.prompts.options.includes('code-coverage') && !api.hasVite) {
    api.onExitLog(
      "Code coverage isn't supported for Webpack yet. Please use Vite CLI instead.",
    );
  }

  api.extendPackageJson(extendPackageJson);
};
