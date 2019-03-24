/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 */

module.exports = function (api) {
  api.render('./base')
  api.prompts.options.forEach((val) => {
    if (val === 'scripts') {
      api.extendPackageJson({
        scripts: {
          "serve:test:lighthouse": "quasar serve test/lighthouse/reports/ --port 8789",
          "audit:snyk": "snyk test --json > ./test/audits/snyk.json",
          "audit:node_modules": "yarn audit --json > ./test/audits/node_modules_audit.json",
          "audit:licenses": "nlf --summary detail > ./test/audits/licenses.txt",
          "audit:lighthouse": "lighthouse http://localhost:3000 view --output-path=./test/lighthouse/reports/index.html --config-path=./test/lighthouse/configs/full-config.js"
        }
      })
    }
  })
}
