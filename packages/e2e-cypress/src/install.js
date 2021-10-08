/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */

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
    '@cypress/vue': '^3.0.3',
    '@cypress/webpack-dev-server': '^1.6.0',
  },
};

const ciCommandE2e =
  'cross-env E2E_TEST=true start-test "quasar dev" http-get://localhost:8080 "cypress run"';
const ciCommandUnit = 'cypress run-ct';

module.exports = function (api) {
  api.compatibleWith('quasar', '^2.0.0');
  api.compatibleWith('@quasar/app', '^3.0.0');

  api.render('./templates/base');

  api.render(
    `./templates/${
      api.prompts.options.includes('typescript') ? '' : 'no-'
    }typescript`,
  );

  if (api.prompts.options.includes('cct')) {
    api.render('./templates/cct');
  }

  api.extendJsonFile('quasar.testing.json', {
    'e2e-cypress': {
      runnerCommand: ciCommandE2e,
    },
    'unit-cypress': {
      runnerCommand: ciCommandUnit,
    },
  });

  api.extendJsonFile('.vscode/settings.json', {
    'json.schemas': [
      {
        fileMatch: ['cypress.json'],
        url: 'https://on.cypress.io/cypress.schema.json',
      },
    ],
  });

  if (api.prompts.options.includes('scripts')) {
    const scripts = {
      scripts: {
        // We use cross-env to set a flag which the extension will catch preventing "quasar dev" to open a window
        // "http-get" must be used because "webpack-dev-server" won't answer
        //  HEAD requests which are performed by default by the underlying "wait-on"
        // See https://github.com/bahmutov/start-server-and-test#note-for-webpack-dev-server-users
        'test:e2e':
          'cross-env E2E_TEST=true start-test "quasar dev" http-get://localhost:8080 "cypress open"',
        'test:e2e:ci': ciCommandE2e,
      },
    };
    if (api.prompts.options.includes('cct')) {
      scripts.scripts['test:unit'] = 'cypress open-ct';
      scripts.scripts['test:unit:ci'] = ciCommandUnit;
    }
    extendPackageJson = __mergeDeep(extendPackageJson, scripts);
  }

  if (api.prompts.options.includes('typescript')) {
    const tsconfig = require(`${api.appDir}/tsconfig.json`);

    const exclude = [];

    if (!tsconfig.exclude || !tsconfig.exclude.includes('test/cypress')) {
      // Prevent clash of global Jest and Cypress types on Cypress tests
      exclude.push('test/cypress');
    }

    // Specifying "exclude" property, if not already present, will overwrite the preset option
    // We copy over the preset values to assure they are considered too
    if (!tsconfig.exclude || tsconfig.exclude.length === 0) {
      const { readFileSync } = require('fs');
      const { parse } = require('json5');
      const tsconfigPreset = parse(
        readFileSync(require.resolve('@quasar/app/tsconfig-preset.json'), {
          encoding: 'utf8',
        }),
      );
      exclude.push(...tsconfigPreset.exclude);
    }

    api.extendJsonFile('tsconfig.json', { exclude });
  }

  api.extendPackageJson(extendPackageJson);
};
