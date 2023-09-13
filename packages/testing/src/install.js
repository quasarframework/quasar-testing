/**
 * Quasar App Extension install script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 *
 */

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.0.0');

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0');
  } else if (api.hasWebpack) {
    // TODO: should be "@quasar/app-webpack" but that is not backward compatible
    // Remove when Qv3 comes out, or when "@quasar/app" is officially deprecated
    api.compatibleWith('@quasar/app', '^3.0.0');
  }

  const execa = require('execa');

  const addOrInvoke = process.argv.indexOf('invoke') > -1 ? 'invoke' : 'add';

  for (const harness of api.prompts.harnesses) {
    try {
      const code = await execa(
        'quasar',
        ['ext', addOrInvoke, `@quasar/testing-${harness}`],
        {
          stdio: 'inherit',
          cwd: api.resolve.app('.'),
        },
      );
      if (code.exitCode !== 0) {
        console.error(`Extension ${harness} failed to install.`);
        if (addOrInvoke === 'invoke') {
          console.log('Extra debug:\n', code);
        }
        process.exit(1);
      }
    } catch (e) {
      console.error(`Extension ${harness} failed to install:`, e);
    }
  }
};
