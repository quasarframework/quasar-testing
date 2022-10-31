/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 * based on https://stackoverflow.com/a/49798508
 *
 * @param {...object} sources - Objects to merge
 * @returns {object} New object with merged key/values
 */

const { join } = require('path');

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

const { peerDependencies } = require(join(__dirname, '..', 'package.json'));

function getCompatibleDevDependencies(packageNames) {
  const devDependencies = {};

  for (const packageName of packageNames) {
    devDependencies[packageName] = peerDependencies[packageName];
  }

  return devDependencies;
}

const ciCommand = 'jest --ci';

// make sure the object exists
let extendPackageJson = {
  devDependencies: getCompatibleDevDependencies(['@vue/test-utils', 'jest']),
};

module.exports = function (api) {
  api.extendJsonFile('quasar.testing.json', {
    'unit-jest': {
      runnerCommand: ciCommand,
    },
  });

  api.render('./templates/base', {}, true);

  api.render(
    `./templates/${
      api.prompts.options.includes('typescript') ? '' : 'no-'
    }typescript`,
  );

  if (api.prompts.options.includes('majestic')) {
    const majestic = {
      devDependencies: getCompatibleDevDependencies(['majestic']),
    };

    if (api.prompts.options.includes('scripts')) {
      majestic.scripts = {
        'test:unit:ui': 'majestic',
      };
    }

    extendPackageJson = __mergeDeep(extendPackageJson, majestic);
  }

  if (api.prompts.options.includes('scripts')) {
    const scripts = {
      scripts: {
        test: 'echo "See package.json => scripts for available tests." && exit 0',
        'test:unit': 'jest --updateSnapshot',
        'test:unit:ci': ciCommand,
        'test:unit:coverage': 'jest --coverage',
        'test:unit:watch': 'jest --watch',
        'test:unit:watchAll': 'jest --watchAll',
      },
    };
    extendPackageJson = __mergeDeep(extendPackageJson, scripts);
  }

  api.extendPackageJson(extendPackageJson);
};
