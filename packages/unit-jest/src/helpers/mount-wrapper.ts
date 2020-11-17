import { mount, shallowMount, Wrapper } from '@vue/test-utils';
import Vue, { ComponentOptions, VueConstructor } from 'vue';
import { QuasarMountOptions, VueClass } from './models';

export function mountWrapper<V extends Vue>(
  localVue: VueConstructor<Vue>,
  component: ComponentOptions<V>,
  options?: QuasarMountOptions,
): Wrapper<V>;
export function mountWrapper<V extends Vue>(
  localVue: VueConstructor<Vue>,
  component: VueClass<V>,
  options?: QuasarMountOptions,
): Wrapper<V>;
export function mountWrapper<V extends Vue>(
  localVue: VueConstructor<Vue>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any,
  options: QuasarMountOptions = {},
): Wrapper<V> {
  const mountFn = options.mount?.type === 'full' ? mount : shallowMount;

  // mount functions usually require a Vue component,
  //  but due to Jest extensions resolution we get them
  //  working even when we provide only the script part
  // See https://github.com/vuejs/vue-jest/issues/188
  return mountFn<V>(component, {
    ...options.mount,
    propsData: { ...options.mount?.propsData, ...options.propsData },
    localVue,
  });
}
