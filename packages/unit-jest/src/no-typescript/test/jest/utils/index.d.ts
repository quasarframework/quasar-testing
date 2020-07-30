import { QSsrContext } from "@quasar/app";
import { mount, Wrapper } from "@vue/test-utils";
import { QuasarPluginOptions } from "quasar";
import Vue, { ComponentOptions, PluginObject, PluginFunction } from "vue";

/**
 * Utility type to declare an extended Vue constructor
 */
type VueClass<V extends Vue> = (new (...args: any[]) => V) & typeof Vue;

type VueMountOptions = Parameters<typeof mount>[1];
// TODO: for some reason `PluginFunction<any>` (yelded by `Parameters<typeof Vue.use>[0]`)
//  isn't compatible with `PluginFunction<never>` (eg. VueRouter)
// `PluginFunction<any | never>` won't work either because it get swallowed by the `any` part
type VuePlugin =
  | PluginObject<any>
  | PluginObject<never>
  | PluginFunction<any>
  | PluginFunction<never>;

type VuePluginOptions = any[];

/**
 * `mountQuasar` options interface
 */
interface QuasarMountOptions {
  // @vue/test-utils "mount" and "shallowMount" options signature are the same on v1.0.3
  // If they'll diverge in future, it should be possible to model a discriminated union over "type" property
  mount?: {
    type?: "full" | "shallow";
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
  plugins?: (VuePlugin | [VuePlugin, ...VuePluginOptions])[];
}

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
): (propsData?: QuasarMountOptions["propsData"]) => Wrapper<V>;
declare function mountFactory<V extends Vue>(
  component: ComponentOptions<V>,
  options?: QuasarMountOptions
): (propsData?: QuasarMountOptions["propsData"]) => Wrapper<V>;
declare function mountFactory<V extends Vue>(
  component: any,
  options: QuasarMountOptions
): (propsData?: QuasarMountOptions["propsData"]) => Wrapper<V>;

/**
 * Injections for Components with a QPage root Element
 */
declare function qLayoutInjections(): Record<string, any>;

declare function ssrContextMock(): {
  req: {
    headers: {};
  };
  res: {
    setHeader: () => undefined;
  };
};

declare function setCookies(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cookies: Record<string, any>,
  ssrContext?: QSsrContext
): void;
