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
  devDependencies: getCompatibleDevDependencies(['@vue/test-utils', 'vitest']),
};

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.12.7');
  api.compatibleWith('vue', '^3.3.4');
  // hasTypescript is only available from v1.6.0 onwards
  // Vitest 1.0 requires Vite 5, which is only officially supported by @quasar/app-vite v2
  // Yet, there are workarounds to make @quasar/app-vite@v1 work with Vite 5, so we aren't restricting this AE only to v2
  // See https://github.com/quasarframework/quasar/issues/14077
  api.compatibleWith('@quasar/app-vite', '^1.6.0 || ^2.0.0-alpha.44');

  api.render(`./templates/${await api.hasTypescript() ? '' : 'no-'}typescript`);

  if (api.prompts.options.includes('ui')) {
    const ui = {
      devDependencies: getCompatibleDevDependencies(['@vitest/ui']),
    };

    ui.scripts = {
      'test:unit:ui': 'vitest --ui',
    };

    extendPackageJson = __mergeDeep(extendPackageJson, ui);
  }

  const scripts = {
    scripts: {
      test: 'echo "See package.json => scripts for available tests." && exit 0',
      'test:unit': 'vitest',
      'test:unit:ci': 'vitest run',
    },
  };
  extendPackageJson = __mergeDeep(extendPackageJson, scripts);

  api.extendPackageJson(extendPackageJson);
};
