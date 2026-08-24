/**
 * Quasar App Extension prompts script
 * https://quasar.dev/app-extensions/development-guide/prompts-api
 */

const { enforcedDevServerPort } = require('./shared');

module.exports = async function () {
  // TODO: @clack/prompts is ESM-only, this file is CJS until the TS rewrite
  const { text, confirm, cancel, isCancel } = await import('@clack/prompts');

  const port = await text({
    message: 'Choose which port the app will be served when run for Cypress:',
    initialValue: String(enforcedDevServerPort),
    validate: (value) =>
      /^\d+$/.test(value) ? undefined : 'Enter a valid port number',
  });
  if (isCancel(port)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const wantsCodeCoverage = await confirm({
    message: 'Enable code coverage?',
    initialValue: false,
  });
  if (isCancel(wantsCodeCoverage)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return {
    port: Number(port),
    options: wantsCodeCoverage ? ['code-coverage'] : [],
  };
};
