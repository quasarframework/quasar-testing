/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

// TODO: we may be able to remove this once Cypress 9.x is reliable,
// since 9.1 should set a process.env.CYPRESS variable
module.exports = function (api) {
  api.extendQuasarConf((conf) => {
    if (process.env.E2E_TEST) {
      conf.devServer.open = false;
    }
  });
};
