import { config } from '@vue/test-utils';
import cloneDeep from 'clone-deep';
import { Quasar, QuasarPluginOptions } from 'quasar';
import { ssrContextMock } from './ssr-context-mock';
// Change this if you have a different entrypoint for the main scss.
import 'src/css/app.scss';
// Quasar styles
import 'quasar/src/css/index.sass';

// ICON SETS
// If you use multiple or different icon-sets then the default, be sure to import them here.
import 'quasar/dist/icon-set/material-icons.umd.prod';
import '@quasar/extras/material-icons/material-icons.css';

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
