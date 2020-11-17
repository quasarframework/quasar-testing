import { Wrapper } from '@vue/test-utils';
import Vue, { ComponentOptions } from 'vue';
import { QuasarMountOptions, VueClass } from './models';
import { createLocalVueForQuasar } from './create-local-quasar';
import { mountWrapper } from './mount-wrapper';

// We cannot infer component type from `shallowMount` using `Parameters<typeof shallowMount>`
//  because it has overloads but the last signature isn't the most general one, while `Parameters<...>`
//  will automatically resolve to the last signature thinking it's the most generic one.
// See https://github.com/Microsoft/TypeScript/issues/24275#issuecomment-390701982
export function mountQuasar<V extends Vue>(
  component: ComponentOptions<V>,
  options?: QuasarMountOptions,
): Wrapper<V>;
export function mountQuasar<V extends Vue>(
  component: VueClass<V>,
  options?: QuasarMountOptions,
): Wrapper<V>;
export function mountQuasar<V extends Vue>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any,
  options: QuasarMountOptions = {},
): Wrapper<V> {
  const localVue = createLocalVueForQuasar(options);

  return mountWrapper(localVue, component, options);
}
