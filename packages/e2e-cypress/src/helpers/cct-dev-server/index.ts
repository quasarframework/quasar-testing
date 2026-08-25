/* eslint-disable */

// These plugins serve the dev server, not tests. checker spawns type-check and
// lint processes, the devtools plugin injects a browser-only overlay.
const EXCLUDED_PLUGIN_NAMES = [
  'vite-plugin-checker',
  'vite-plugin-vue-devtools',
];

// Some plugins register companion plugins with names like
// "vite-plugin-vue-devtools:append-code", so match the prefix too.
function isExcludedPlugin(name: string, excludedNames: string[]) {
  return excludedNames.some(
    (excludedName) =>
      name === excludedName || name.startsWith(`${excludedName}:`),
  );
}

export interface QuasarComponentTestingConfigOptions {
  /**
   * Names of Vite plugins to remove from the config. A name matches exactly
   * or as a `<name>:` prefix, which covers plugins that register companion
   * plugins.
   *
   * An array adds to the default exclusions. A function receives the default
   * exclusions and returns the final list, e.g. `() => []` disables the
   * filtering, `(defaults) => defaults.filter((name) => name !== 'vite-plugin-vue-devtools')`
   * keeps a plugin the helper removes by default.
   */
  excludePlugins?: string[] | ((defaultExclusions: string[]) => string[]);
}

/**
 * The component-testing part of the Cypress configuration, meant to be
 * spread into the `component` block. It provides the dev server, with a
 * Vite config built from quasar.config by @quasar/app-vite.
 */
export function quasarComponentTestingConfig(
  options: QuasarComponentTestingConfigOptions = {},
) {
  const { excludePlugins } = options;
  const excludedPluginNames =
    typeof excludePlugins === 'function'
      ? excludePlugins([...EXCLUDED_PLUGIN_NAMES])
      : [...EXCLUDED_PLUGIN_NAMES, ...(excludePlugins ?? [])];

  return {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
      viteConfig: async () => {
        const { getTestingConfig } = await import('@quasar/app-vite/testing');
        const config = await getTestingConfig();

        // The dev config warms up the generated client entry (.quasar/dev-spa/client-entry.js).
        // Only "quasar dev" generates that file, so Vite logs a pre-transform error otherwise.
        delete config.server?.warmup;

        const plugins = ((config.plugins ?? []) as unknown[]).flat(
          Infinity,
        ) as ({ name?: string } | null | undefined | false)[];
        config.plugins = plugins.filter(
          (plugin) =>
            !!plugin && !isExcludedPlugin(plugin.name ?? '', excludedPluginNames),
        ) as NonNullable<typeof config.plugins>;

        // [1] -> https://github.com/cypress-io/cypress/issues/22505#issuecomment-1277855100
        // [1] Delete base so it can correctly be set by Cypress
        delete config.base;

        return config;
      },
    },
    // If not set, tests for components that load public assets break.
    // See https://github.com/quasarframework/quasar-testing/issues/379
    devServerPublicPathRoute: '',
  };
}
