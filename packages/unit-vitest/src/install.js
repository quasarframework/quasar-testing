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

const ciCommand = 'vitest run';

// make sure the object exists
let extendPackageJson = {
  devDependencies: {
    '@vue/test-utils': '^2.0.0',
  },
};

module.exports = function (api) {
  api.extendJsonFile('quasar.testing.json', {
    'unit-vitest': {
      runnerCommand: ciCommand,
    },
  });

  api.render('./templates/base', {}, true);

  if (api.prompts.options.includes('ui')) {
    const ui = {
      devDependencies: {
        '@vitest/ui': '^0.14.1',
      },
    };

    if (api.prompts.options.includes('scripts')) {
      ui.scripts = {
        'test:unit:ui': 'vitest --ui',
      };
    }

    extendPackageJson = __mergeDeep(extendPackageJson, ui);
  }

  if (api.prompts.options.includes('scripts')) {
    const scripts = {
      scripts: {
        test: 'echo "See package.json => scripts for available tests." && exit 0',
        'test:unit': 'vitest',
        'test:unit:ci': ciCommand,
      },
    };
    extendPackageJson = __mergeDeep(extendPackageJson, scripts);
  }

  api.extendPackageJson(extendPackageJson);
};
