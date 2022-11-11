import { afterAll } from '@jest/globals';
import { config } from '@vue/test-utils';
import { cloneDeep } from 'lodash-es';
import { Quasar, QuasarPluginOptions } from 'quasar';

// All Quasar components are registered by default if no `components` option
// is provided via these helper options
// TODO: why this happens is currently unknown, but handy.
// We know those components aren't available into config.global.components,
// so it must be something happening into Vue Test Utils or Jest.
export function installQuasarPlugin(options?: Partial<QuasarPluginOptions>) {
  const globalConfigBackup = cloneDeep(config.global);

  // We must execute this outside a `beforeAll`
  // or `mount` calls outside `test` context (eg. called into a `describe` context and shared by multiple tests)
  // won't have those defaults applied
  config.global.plugins.unshift([Quasar, options]);

  afterAll(() => {
    config.global = globalConfigBackup;
  });
}
