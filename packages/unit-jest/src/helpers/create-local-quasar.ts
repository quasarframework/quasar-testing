import { createLocalVue } from '@vue/test-utils';
import { Quasar } from 'quasar';
import { QuasarMountOptions } from './models';

export function createLocalVueForQuasar({
  quasar,
  plugins,
  mount,
}: QuasarMountOptions): ReturnType<typeof createLocalVue> {
  const localVue = mount?.localVue ?? createLocalVue();

  // Quasar skips installation if it already went through it, but this applies to different Vue instances too
  // Here we reset the installation flag to allow the plugin to be correctly installed on another Vue instance
  Quasar.__qInstalled = undefined;
  localVue.use(Quasar, quasar);

  (plugins ?? []).forEach((pluginDescriptor) => {
    if (!Array.isArray(pluginDescriptor)) {
      pluginDescriptor = [pluginDescriptor];
    }

    const [plugin, ...options] = pluginDescriptor;
    localVue.use(plugin, ...options);
  });

  // (options.bootFunctions ?? []).forEach(bootFn => {
  //   bootFn({ app, store, router, Vue: localVue, ssrContext });
  // });

  return localVue;
}
