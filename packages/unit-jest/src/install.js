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
  devDependencies: getCompatibleDevDependencies([
    '@vue/test-utils',
    'jest',
    'eslint-plugin-jest',
  ]),
};

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.0.4');
  // hasTypescript is only available from v3.11.0 onwards
  api.compatibleWith('@quasar/app-webpack', '^3.11.0 || ^4.0.0-alpha.20');

  api.render('./templates/base', {}, true);

  api.render(`./templates/${await api.hasTypescript() ? '' : 'no-'}typescript`);

  if (api.prompts.options.includes('majestic')) {
    const majestic = {
      devDependencies: getCompatibleDevDependencies(['majestic']),
    };

    majestic.scripts = {
      'test:unit:ui': 'majestic',
    };

    extendPackageJson = __mergeDeep(extendPackageJson, majestic);
  }

  const scripts = {
    scripts: {
      test: 'echo "See package.json => scripts for available tests." && exit 0',
      'test:unit': 'jest',
      'test:unit:ci': 'jest --ci',
      'test:unit:coverage': 'jest --coverage',
      'test:unit:watch': 'jest --watch',
      'test:unit:watchAll': 'jest --watchAll',
    },
  };
  extendPackageJson = __mergeDeep(extendPackageJson, scripts);

  api.extendPackageJson(extendPackageJson);
};
