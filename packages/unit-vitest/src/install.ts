import { InstallAPI } from '@quasar/app-vite';
import { merge } from 'es-toolkit';

type PackageJson = Record<string, Record<string, string>>;

function getCompatibleDevDependencies(
  aeDevDependencies: PackageJson[string],
  packageNames: (keyof typeof aeDevDependencies)[],
) {
  const devDependencies: PackageJson[string] = {};

  for (const packageName of packageNames) {
    devDependencies[packageName] = aeDevDependencies[packageName];
  }

  return devDependencies;
}

export default async function (api: InstallAPI) {
  // We use devDependencies instead of peerDependencies because devDependencies are usually the latest version
  // and peerDependencies could contain a string supporting multiple major versions (e.g. "cypress": "^12.2.0 || ^13.1.0")
  const { devDependencies: aeDevDependencies } = (await import(
    // We can't import it statically, it would cause a problem with the built output folder structure
    // and `@quasar/app-vite` expects to find AE files (install.js, etc) at the first level of the `dist` folder
    import.meta.dirname + '../package.json'
  )) as PackageJson;

  const extendPackageJson: PackageJson = {
    devDependencies: getCompatibleDevDependencies(aeDevDependencies, [
      '@vue/test-utils',
      'vitest',
    ]),
  };

  api.compatibleWith('quasar', '^2.12.7');
  api.compatibleWith('vue', '^3.3.4');
  api.compatibleWith('@quasar/app-vite', '^2.4.0');

  api.render(
    `./templates/${(await api.hasTypescript()) ? '' : 'no-'}typescript`,
  );

  if ((api.prompts.options as string[]).includes('ui')) {
    const ui: PackageJson = {
      devDependencies: getCompatibleDevDependencies(aeDevDependencies, [
        '@vitest/ui',
      ]),
    };

    ui.scripts = {
      'test:unit:ui': 'vitest --ui',
    };

    merge(extendPackageJson, ui);
  }

  const scripts = {
    scripts: {
      test: 'echo "See package.json => scripts for available tests." && exit 0',
      'test:unit': 'vitest',
      'test:unit:ci': 'vitest run',
    },
  };
  merge(extendPackageJson, scripts);

  api.extendPackageJson(extendPackageJson);

  if (await api.hasLint()) {
    api.onExitLog(
      'Check out https://github.com/quasarframework/quasar-testing/tree/dev/packages/unit-vitest to see how to add proper Vitest linting configuration to your project.',
    );
  }
}
