import { mount, Wrapper } from '@vue/test-utils';
import { QuasarPluginOptions } from 'quasar';
import Vue, { ComponentOptions, PluginObject } from 'vue';

/**
 * Utility type to declare an extended Vue constructor
 */
type VueClass<V extends Vue> = (new (...args: any[]) => V) & typeof Vue;

/**
 * `mountQuasar` options interface
 */
interface QuasarMountOptions {
  // @vue/test-utils "mount" and "shallowMount" options signature are the same on v1.0.3
  // If they'll diverge in future, it should be possible to model a discriminated union over "shallow" property
  mount?: {
    shallow?: boolean;
  } & Parameters<typeof mount>[1];
  quasar?: Partial<QuasarPluginOptions>;
  ssr?: boolean;
  cookies?: Record<string, any>;
  // TODO: due to Vue components overcomplicated typings and multiple flavours it doesn't seem possible
  //  to both extract props typings AND get a correctly typed wrapper instance
  // Composition, Class and Options API all have different and partially incompatible types
  // We'll check if the situation gets better with Vue3 typings
  propsData?: Record<string, any>;
  plugins?: PluginObject<any>[];
}

// https://eddyerburgh.me/mock-vuex-in-vue-unit-tests
// We cannot infer component type from `shallowMount` using `Parameters<typeof shallowMount>`
//  because it has overloads but the last signature isn't the most general one, while `Parameters<...>`
//  will automatically resolve to the last signature thinking it's the most generic one.
// See https://github.com/Microsoft/TypeScript/issues/24275#issuecomment-390701982
declare function mountQuasar<V extends Vue>(
  component: ComponentOptions<V>,
  options?: QuasarMountOptions
): Wrapper<V>;
declare function mountQuasar<V extends Vue>(
  component: VueClass<V>,
  options?: QuasarMountOptions
): Wrapper<V>;
declare function mountQuasar<V extends Vue>(
  component: any,
  options: QuasarMountOptions
): Wrapper<V>;

declare function mountFactory<V extends Vue>(
  component: VueClass<V>,
  options?: QuasarMountOptions
): (propsData?: QuasarMountOptions['propsData']) => Wrapper<V>;
declare function mountFactory<V extends Vue>(
  component: ComponentOptions<V>,
  options?: QuasarMountOptions
): (propsData?: QuasarMountOptions['propsData']) => Wrapper<V>;
declare function mountFactory<V extends Vue>(
  component: any,
  options: QuasarMountOptions
): (propsData?: QuasarMountOptions['propsData']) => Wrapper<V>;
