import { afterAll } from '@jest/globals';
import { config } from '@vue/test-utils';
import { cloneDeep } from 'lodash-es';
import { Quasar, QuasarPluginOptions } from 'quasar';

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
