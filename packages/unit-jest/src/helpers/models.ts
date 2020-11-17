import type { mount } from '@vue/test-utils';
import { QuasarPluginOptions } from 'quasar';
import Vue, { PluginFunction, PluginObject } from 'vue';

/**
 * Utility type to declare an extended Vue constructor
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VueClass<V extends Vue> = (new (...args: any[]) => V) & typeof Vue;

export type VueMountOptions = Parameters<typeof mount>[1];

// TODO: for some reason `PluginFunction<any>` (yelded by `Parameters<typeof Vue.use>[0]`)
//  isn't compatible with `PluginFunction<never>` (eg. VueRouter)
// `PluginFunction<any | never>` won't work either because it get swallowed by the `any` part
export type VuePlugin =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | PluginObject<any>
  | PluginObject<never>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | PluginFunction<any>
  | PluginFunction<never>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VuePluginOptions = any[];

/**
 * `mountQuasar` options interface
 */
export interface QuasarMountOptions {
  // @vue/test-utils "mount" and "shallowMount" options signature are the same on v1.0.3
  // If they'll diverge in future, it should be possible to model a discriminated union over "type" property
  mount?: {
    type?: 'full' | 'shallow';
  } & VueMountOptions;
  quasar?: Partial<QuasarPluginOptions>;
  // TODO: due to Vue components overcomplicated typings and multiple flavours it doesn't seem possible
  //  to both extract props typings AND get a correctly typed wrapper instance
  // Composition, Class and Options API all have different and partially incompatible types
  // We'll check if the situation gets better with Vue3 typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propsData?: Record<string, any>;
  /** Vue plugins to load */
  // TODO: check if we can type Vue plugin options
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: (VuePlugin | [VuePlugin, ...VuePluginOptions])[];
}
