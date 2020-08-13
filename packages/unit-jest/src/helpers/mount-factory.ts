import { Wrapper } from "@vue/test-utils";
import Vue, { ComponentOptions } from "vue";
import { VueClass, QuasarMountOptions } from "./models";
import { createLocalVueForQuasar } from "./create-local-quasar";
import { mountQuasar } from "./mount-quasar";

export function mountFactory<V extends Vue>(
  component: VueClass<V>,
  options?: QuasarMountOptions
): (propsData?: QuasarMountOptions["propsData"]) => Wrapper<V>;
export function mountFactory<V extends Vue>(
  component: ComponentOptions<V>,
  options?: QuasarMountOptions
): (propsData?: QuasarMountOptions["propsData"]) => Wrapper<V>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mountFactory(component: any, options: QuasarMountOptions = {}) {
  if (!options.mount || !options.mount.localVue) {
    options.mount = {
      ...options.mount,
      // Cache localVue instance, as options cannot change anymore at this point
      localVue: createLocalVueForQuasar(options),
    };
  }

  return (propsData?: QuasarMountOptions["propsData"]) =>
    mountQuasar(component, {
      ...options,
      propsData: { ...options.propsData, ...propsData },
    });
}
