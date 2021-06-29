import { afterAll } from '@jest/globals';
import { config } from '@vue/test-utils';
import { cloneDeep } from 'lodash-es';
import { Quasar, QuasarPluginOptions } from 'quasar';

export function installQuasarPlugin(options?: Partial<QuasarPluginOptions>) {
  const globalConfigBackup = cloneDeep(config.global);

  console.log(globalConfigBackup);
  console.log(Quasar);

  // We must execute this outside a `beforeAll`
  // or `mount` calls outside `test` context (eg. called into a `describe` context and shared by multiple tests)
  // won't have those defaults applied
  config.global.plugins.unshift([Quasar, options]);

  console.log(config.global);

  afterAll(() => {
    config.global = globalConfigBackup;
  });
}
