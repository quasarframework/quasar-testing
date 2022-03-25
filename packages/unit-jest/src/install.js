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

const ciCommand = 'jest --ci';

// make sure the object exists
let extendPackageJson = {
  devDependencies: {
    'eslint-plugin-jest': '^25.2.2',
  },
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
      devDependencies: {
        majestic: '^1.7.0',
      },
      scripts: {
        'test:unit:ui': 'majestic',
      },
    };
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
        'serve:test:coverage':
          'quasar serve test/jest/coverage/lcov-report/ --port 8788',
        'concurrently:dev:jest': 'concurrently "quasar dev" "jest --watch"',
      },
    };
    extendPackageJson = __mergeDeep(extendPackageJson, scripts);
  }

  api.extendPackageJson(extendPackageJson);

  if (api.prompts.babel) {
    api.render(`./templates/${api.prompts.babel}`);
  }
};
