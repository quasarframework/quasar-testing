import { config } from '@vue/test-utils';
import cloneDeep from 'clone-deep';
import { Quasar, QuasarPluginOptions } from 'quasar';
import { ssrContextMock } from './ssr-context-mock';

export function installQuasarPlugin(options?: Partial<QuasarPluginOptions>) {
  const globalConfigBackup = cloneDeep(config.global);

  // We must execute this outside a `beforeAll`
  // or `mount` calls outside `test` context (eg. called into a `describe` context and shared by multiple tests)
  // won't have those defaults applied
  config.global.plugins.unshift([Quasar, options, ssrContextMock()]);

  after(() => {
    config.global = globalConfigBackup;
  });
}
