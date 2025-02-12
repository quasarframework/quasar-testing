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

function setCorrectVitestVersion(package, isViteOne) {
  return {
    devDependencies: {
      // Depending on the version of vite we will decide on which vitest version we should use
      // vite v1 will not work well with vitest > 2.x. Also, we are pinning to these specific versions because of this
      // issue: https://github.com/vitest-dev/vitest/security/advisories/GHSA-9crc-q9x8-hgqq
      [package]: isViteOne ?  '>=1.6.1 <2.0.0' : '>=2.1.9 <3.0.0 || >=3.0.5'
    }
  }
} 

// make sure the object exists
let extendPackageJson = {};

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.12.7');
  api.compatibleWith('vue', '^3.3.4');
  // hasTypescript is only available from v1.6.0 onwards
  // Vitest 1.0 requires Vite 5, which is only officially supported by @quasar/app-vite v2
  // Yet, there are workarounds to make @quasar/app-vite@v1 work with Vite 5, so we aren't restricting this AE only to v2
  // See https://github.com/quasarframework/quasar/issues/14077
  api.compatibleWith('@quasar/app-vite', '^1.6.0 || ^2.0.0-alpha.44');

  api.render(
    `./templates/${(await api.hasTypescript()) ? '' : 'no-'}typescript`,
  );

  if (api.prompts.options.includes('ui')) {
    const isViteOne = api.hasPackage('@quasar/app-vite', '^1.0.0');
    const vitestDependency = setCorrectVitestVersion('vitest', isViteOne);
    const ui = setCorrectVitestVersion('@vitest/ui', isViteOne);

    ui.scripts = {
      'test:unit:ui': 'vitest --ui',
    };

    extendPackageJson = __mergeDeep(extendPackageJson, vitestDependency);
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
