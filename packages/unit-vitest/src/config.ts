/**
 * Config-time helper for vitest.config files.
 *
 * This entry ships built to dist: vitest.config files run in Node, which
 * does not type-strip TypeScript inside node_modules.
 */

import { getTestingConfig } from '@quasar/app-vite/testing';
import type { PluginOption, UserConfig } from 'vite';

// These plugins serve the dev server, not tests. checker spawns type-check and
// lint processes, the devtools plugin injects a browser-only overlay.
const EXCLUDED_PLUGIN_NAMES = [
  'vite-plugin-checker',
  'vite-plugin-vue-devtools',
];

export interface QuasarViteTestingConfigOptions {
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

// Some plugins register companion plugins with names like
// "vite-plugin-vue-devtools:append-code", so match the prefix too.
function isExcludedPlugin(name: string, excludedNames: string[]) {
  return excludedNames.some(
    (excludedName) =>
      name === excludedName || name.startsWith(`${excludedName}:`),
  );
}

/**
 * The app's Vite config, built from quasar.config by @quasar/app-vite,
 * with dev-server-only plugins removed.
 */
export async function quasarViteTestingConfig(
  options: QuasarViteTestingConfigOptions = {},
): Promise<UserConfig> {
  const { excludePlugins } = options;
  const excludedPluginNames =
    typeof excludePlugins === 'function'
      ? excludePlugins([...EXCLUDED_PLUGIN_NAMES])
      : [...EXCLUDED_PLUGIN_NAMES, ...(excludePlugins ?? [])];

  const config = await getTestingConfig();

  // The dev config warms up the generated client entry (.quasar/dev-spa/client-entry.js).
  // Only "quasar dev" generates that file, so Vite logs a pre-transform error
  // for it on every test run.
  delete config.server?.warmup;

  const plugins = ((config.plugins ?? []) as unknown[]).flat(Infinity) as (
    | { name?: string }
    | null
    | undefined
    | false
  )[];
  config.plugins = plugins.filter(
    (plugin) =>
      !!plugin && !isExcludedPlugin(plugin.name ?? '', excludedPluginNames),
  ) as PluginOption[];

  return config;
}
