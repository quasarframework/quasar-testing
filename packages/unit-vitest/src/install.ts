/**
 * Quasar App Extension install script
 * https://quasar.dev/app-extensions/development-guide/install-api
 */

import { readFileSync } from 'node:fs';
import { defineInstallScript } from '#q-app';

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
  api.compatibleWith('vue', '^3.3.4');
  api.compatibleWith('@quasar/app-vite', '^3.0.0');

  api.render(
    `./templates/${(await api.hasTypescript()) ? '' : 'no-'}typescript`,
  );

  const wantsUi = api.prompts['ui'] === true;

  api.extendPackageJson({
    devDependencies: pickDevDependencies([
      '@vue/test-utils',
      'vitest',
      ...(wantsUi ? ['@vitest/ui'] : []),
    ]),
    scripts: {
      test: 'echo "See package.json => scripts for available tests." && exit 0',
      'test:unit': 'vitest',
      'test:unit:ci': 'vitest run',
      ...(wantsUi ? { 'test:unit:ui': 'vitest --ui' } : {}),
    },
  });

  // TODO: add oxlint support
  if (api.hasPackage('eslint')) {
    api.onExitLog(
      'Check out https://github.com/quasarframework/quasar-testing/tree/dev/packages/unit-vitest to see how to add proper Vitest linting configuration to your project.',
    );
  }
});
