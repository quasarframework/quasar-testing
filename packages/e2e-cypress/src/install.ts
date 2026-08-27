/**
 * Quasar App Extension install script
 * https://quasar.dev/app-extensions/development-guide/install-api
 */

import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { defineInstallScript } from '#q-app';
import { normalizePromptsAnswers } from './prompts';

// devDependencies is the version source because peerDependencies can hold
// ranges spanning multiple majors.
const { devDependencies: aeDevDependencies } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
) as { devDependencies: Partial<Record<string, string>> };

function pickDevDependencies(packageNames: string[]) {
  const devDependencies: Record<string, string> = {};

  for (const packageName of packageNames) {
    const version = aeDevDependencies[packageName];
    if (version === undefined) {
      throw new Error(
        `"${packageName}" is not listed in the devDependencies of the AE package.json`,
      );
    }

    devDependencies[packageName] = version;
  }

  return devDependencies;
}

export default defineInstallScript(async (api) => {
  api.compatibleWith('quasar', '^2.24.0');
  api.compatibleWith('@quasar/app-vite', '^3.0.0');

  const prompts = normalizePromptsAnswers(api.prompts);
  const shouldSupportTypeScript = await api.hasTypescript();
  const shouldAddCodeCoverage = prompts.options.includes('code-coverage');
  const testEnvCommand = 'cross-env NODE_ENV=test';
  // "http-get" must be used because the underlying "wait-on" performs HEAD requests by default
  // On some OSes "localhost" resolves to "::1" instead of "127.0.0.1", so use the IP explicitly
  // See https://github.com/bahmutov/start-server-and-test/issues/358
  const e2eServerCommand = `${testEnvCommand} start-test "quasar dev" http-get://127.0.0.1:${prompts.port}`;

  api.render('./templates/base', { shouldSupportTypeScript });

  api.render(`./templates/${shouldSupportTypeScript ? '' : 'no-'}typescript`, {
    devServerPort: prompts.port,
    shouldAddCodeCoverage,
    shouldSupportTypeScriptAndVite: shouldSupportTypeScript,
  });

  // eslint-plugin-cypress v7 requires ESLint v10
  const shouldAddEslintPlugin = api.hasPackage('eslint', '>=10');

  api.extendPackageJson({
    devDependencies: pickDevDependencies([
      'cypress',
      ...(shouldAddEslintPlugin ? ['eslint-plugin-cypress'] : []),
    ]),
    scripts: {
      test: 'echo "See package.json => scripts for available tests." && exit 0',
      'test:e2e': `${e2eServerCommand} "cypress open --e2e"`,
      'test:e2e:ci': `${e2eServerCommand} "cypress run --e2e"`,
      'test:component': `${testEnvCommand} cypress open --component`,
      'test:component:ci': `${testEnvCommand} cypress run --component`,
    },
  });

  if (shouldAddCodeCoverage) {
    api.render('./templates/code-coverage');

    // Re-invokes must not append the entries again
    const gitignorePath = api.resolve.app('.gitignore');
    const existingContent = existsSync(gitignorePath)
      ? readFileSync(gitignorePath, 'utf-8')
      : '';
    if (!existingContent.includes('.nyc_output')) {
      appendFileSync(gitignorePath, '\n.nyc_output\ncoverage/\n');
    }
  }

  if (api.hasPackage('eslint')) {
    api.onExitLog(
      'Check out https://github.com/quasarframework/quasar-testing/tree/dev/packages/e2e-cypress to see how to add proper Cypress linting configuration to your project.',
    );
  }
});
