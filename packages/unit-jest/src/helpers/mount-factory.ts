import { Wrapper } from '@vue/test-utils';
import Vue, { ComponentOptions } from 'vue';
import { VueClass, QuasarMountOptions } from './models';
import { createLocalVueForQuasar } from './create-local-quasar';
import { mountWrapper } from './mount-wrapper';

export function mountFactory<V extends Vue>(
  component: VueClass<V>,
  options?: QuasarMountOptions,
): (propsData?: QuasarMountOptions['propsData']) => Wrapper<V>;
export function mountFactory<V extends Vue>(
  component: ComponentOptions<V>,
  options?: QuasarMountOptions,
): (propsData?: QuasarMountOptions['propsData']) => Wrapper<V>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mountFactory(component: any, options: QuasarMountOptions = {}) {
  // Cache localVue instance, as options cannot change anymore at this point
  const localVue = createLocalVueForQuasar(options);

  return (propsData?: QuasarMountOptions['propsData']) =>
    mountWrapper(localVue, component, {
      ...options,
      propsData: { ...options.propsData, ...propsData },
    });
}
