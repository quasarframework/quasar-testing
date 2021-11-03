/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 *  $ quasar ext --add @quasar/testing-unit-jest --skip-pkg
 *  '@quasar/quasar-app-extension-testing-unit-jest': 'link:../packages/unit-jest',
 *
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

const ciCommand = 'jest --ci';

// make sure the object exists
let extendPackageJson = {
  devDependencies: {
    'eslint-plugin-jest': '^24.1.0',
  },
};

module.exports = function (api) {
  api.compatibleWith('quasar', '<2.0.0');
  api.compatibleWith('@quasar/app', '<3.0.0');

  api.extendJsonFile('quasar.testing.json', {
    'unit-jest': {
      runnerCommand: ciCommand,
    },
  });

  api.render('./base', {}, true);

  api.render(
    `./${api.prompts.options.includes('typescript') ? '' : 'no-'}typescript`,
  );

  api.prompts.options.forEach((val) => {
    if (val === 'SFC') {
      api.render('./loader');
    } else if (val === 'wallabyjs') {
      api.render('./wallabyjs');
      const wallaby = require('./wallabyjs/.package.json');
      return (extendPackageJson = __mergeDeep(extendPackageJson, wallaby));
    } else if (val === 'majestic') {
      const majestic = require('./majestic/.package.json');
      const majesticScripts = {
        scripts: {
          'test:unit:ui': 'majestic',
        },
      };
      return (extendPackageJson = __mergeDeep(
        extendPackageJson,
        majestic,
        majesticScripts,
      ));
    } else if (val === 'scripts') {
      const scripts = {
        scripts: {
          test: 'echo "See package.json => scripts for available tests." && exit 0',
          'test:unit': 'jest --updateSnapshot',
          'test:unit:ci': ciCommand,
          'test:unit:coverage': 'jest --coverage',
          'test:unit:watch': 'jest --watch',
          'test:unit:watchAll': 'jest --watchAll',
          'serve:test:coverage':
            'quasar serve test/jest/coverage/lcov-report/ --port 8788',
          'concurrently:dev:jest': 'concurrently "quasar dev" "jest --watch"',
        },
      };
      return (extendPackageJson = __mergeDeep(extendPackageJson, scripts));
    } else if (val === 'typescript') {
      const tsconfig = require(`${api.appDir}/tsconfig.json`);

      const types = [];

      if (
        !tsconfig.compilerOptions.types ||
        !tsconfig.compilerOptions.types.includes('jest')
      ) {
        // Enable global Jest typings
        types.push('jest');
      }

      // Specifying "compilerOptions.types" property, if not already present, will overwrite the preset option
      // We copy over the preset values to assure they are considered too
      if (
        !tsconfig.compilerOptions.types ||
        tsconfig.compilerOptions.types.length === 0
      ) {
        const { readFileSync } = require('fs');
        const { parse } = require('json5');
        const tsconfigPreset = parse(
          readFileSync(require.resolve('@quasar/app/tsconfig-preset.json'), {
            encoding: 'utf8',
          }),
        );
        types.push(...tsconfigPreset.compilerOptions.types);
      }

      api.extendJsonFile('tsconfig.json', {
        compilerOptions: {
          // TODO: this should actually work out-of-the-box the same option
          //  is provided into tsconfig-preset, but "vue-jest"
          //  doesn't process inherited tsconfig due to its usage of a very old package.
          // Every should be solved when "vue-jest" v4 (which will use "ts-jest") will be released.
          // See: https://github.com/vuejs/vue-jest/issues/144#issuecomment-621290457
          esModuleInterop: true,
          types,
        },
      });
    }
  });
  api.extendPackageJson(extendPackageJson);

  if (api.prompts.babel) {
    api.render(`./${api.prompts.babel}`);
  }
};
