/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 *  $ quasar ext --add @quasar/testing-unit-ava --skip-pkg
 *  '@quasar/quasar-app-extension-testing-unit-ava': 'link:../packages/unit-ava',
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
	let result = {}
	for (const source of sources) {
		if (source instanceof Array) {
			if (!(result instanceof Array)) {
				result = []
			}
			result = [...result, ...source]
		} else if (source instanceof Object) {
			for (let [key, value] of Object.entries(source)) {
				if (value instanceof Object && key in result) {
					value = __mergeDeep(result[key], value)
				}
				result = { ...result, [key]: value }
			}
		}
	}
	return result
}

let extendPackageJson = {}

module.exports = function(api) {
  api.render('./base', {}, true)

  api.extendJsonFile('quasar.testing.json', {
    'unit-ava': {
      runnerCommand: 'ava'
    }
  })

	api.prompts.options.forEach((val) => {
		if (val === 'SFC') {
			api.render('./loader')
		}
		else if (val === 'wallabyjs') {
			api.render('./wallabyjs')
			const wallaby = require('./wallabyjs/.package.json')
			return extendPackageJson = __mergeDeep(extendPackageJson, wallaby)
		}
		else if (val === 'scripts') {
			const scripts = {
				scripts: {
					'test:unit': 'ava'
				}
			}
			return extendPackageJson = __mergeDeep(extendPackageJson, scripts)
		}
	})
	api.extendPackageJson(extendPackageJson)

  if (api.prompts.babel) {
    api.render(`./${api.prompts.babel}`)
  }
}
