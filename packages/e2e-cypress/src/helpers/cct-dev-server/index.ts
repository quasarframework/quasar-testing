/* eslint-disable */

// These plugins serve the dev server, not tests. checker spawns type-check and
// lint processes, the devtools plugin injects a browser-only overlay.
const EXCLUDED_PLUGIN_NAMES = [
  'vite-plugin-checker',
  'vite-plugin-vue-devtools',
];

// Some plugins register companion plugins with names like
// "vite-plugin-vue-devtools:append-code", so match the prefix too.
function isExcludedPlugin(name: string) {
  return EXCLUDED_PLUGIN_NAMES.some(
    (excludedName) =>
      name === excludedName || name.startsWith(`${excludedName}:`),
  );
}

export function injectQuasarDevServerConfig() {
  return {
    framework: 'vue',
    bundler: 'vite',
    viteConfig: async () => {
      const { getTestingConfig } = await import('@quasar/app-vite/testing');
      const config = await getTestingConfig();

      // The dev config warms up the generated client entry (.quasar/dev-spa/client-entry.js).
      // Only "quasar dev" generates that file, so Vite logs a pre-transform error otherwise.
      delete config.server?.warmup;

      const plugins = ((config.plugins ?? []) as unknown[]).flat(Infinity) as (
        | { name?: string }
        | null
        | undefined
        | false
      )[];
      config.plugins = plugins.filter(
        (plugin) => !!plugin && !isExcludedPlugin(plugin.name ?? ''),
      ) as NonNullable<typeof config.plugins>;

      // [1] -> https://github.com/cypress-io/cypress/issues/22505#issuecomment-1277855100
      // [1] Delete base so it can correctly be set by Cypress
      delete config.base;

      return config;
    },
  };
}
