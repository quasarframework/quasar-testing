import { config } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { Quasar, QuasarPluginOptions } from 'quasar';

// TODO: not properly documented into the README

// Had the css imports here for styling with CCT but as this file is exported along with commands
// the cypress E2E tests fail because they don't have loaders for css in place.
// So somehow this code is also evaluated when only importing { registerCommands } from the AE.

export function installQuasarPlugin(options?: Partial<QuasarPluginOptions>) {
  const globalConfigBackup = cloneDeep(config.global);

  // We must execute this outside a `beforeAll`
  // or `mount` calls outside `test` context (eg. called into a `describe` context and shared by multiple tests)
  // won't have those defaults applied
  config.global.plugins.unshift([Quasar, options]);

  after(() => {
    config.global = globalConfigBackup;
  });
}
