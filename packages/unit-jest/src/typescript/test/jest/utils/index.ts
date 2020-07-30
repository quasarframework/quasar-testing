import { QSsrContext } from '@quasar/app';
import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils';
import { Cookies, Quasar, QuasarPluginOptions } from 'quasar';
import Vue, { ComponentOptions, PluginFunction, PluginObject } from 'vue';

/**
 * Utility type to declare an extended Vue constructor
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VueClass<V extends Vue> = (new (...args: any[]) => V) & typeof Vue;

type VueMountOptions = Parameters<typeof mount>[1];
// TODO: for some reason `PluginFunction<any>` (yelded by `Parameters<typeof Vue.use>[0]`)
//  isn't compatible with `PluginFunction<never>` (eg. VueRouter)
// `PluginFunction<any | never>` won't work either because it get swallowed by the `any` part
type VuePlugin =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | PluginObject<any>
  | PluginObject<never>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | PluginFunction<any>
  | PluginFunction<never>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VuePluginOptions = any[];

/**
 * `mountQuasar` options interface
 */
interface QuasarMountOptions {
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

// We cannot infer component type from `shallowMount` using `Parameters<typeof shallowMount>`
//  because it has overloads but the last signature isn't the most general one, while `Parameters<...>`
//  will automatically resolve to the last signature thinking it's the most generic one.
// See https://github.com/Microsoft/TypeScript/issues/24275#issuecomment-390701982
export function mountQuasar<V extends Vue>(
  component: ComponentOptions<V>,
  options?: QuasarMountOptions
): Wrapper<V>;
export function mountQuasar<V extends Vue>(
  component: VueClass<V>,
  options?: QuasarMountOptions
): Wrapper<V>;
export function mountQuasar<V extends Vue>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any,
  options: QuasarMountOptions = {}
): Wrapper<V> {
  const localVue = options.mount?.localVue ?? createLocalVue();

  localVue.use(Quasar, options.quasar);

  (options.plugins ?? []).forEach(pluginDescriptor => {
    if (!Array.isArray(pluginDescriptor)) {
      pluginDescriptor = [pluginDescriptor];
    }

    const [plugin, ...options] = pluginDescriptor;
    localVue.use(plugin, ...options);
  });

  const mountFn = options.mount?.type === 'full' ? mount : shallowMount;

  // mount functions usually require a Vue component,
  //  but due to Jest extensions resolution we get them
  //  working even when we provide only the script part
  // See https://github.com/vuejs/vue-jest/issues/188
  return mountFn<V>(component, {
    ...options.mount,
    propsData: { ...options.mount?.propsData, ...options.propsData },
    localVue
  });
}

export function mountFactory<V extends Vue>(
  component: VueClass<V>,
  options?: QuasarMountOptions
): (propsData?: QuasarMountOptions['propsData']) => Wrapper<V>;
export function mountFactory<V extends Vue>(
  component: ComponentOptions<V>,
  options?: QuasarMountOptions
): (propsData?: QuasarMountOptions['propsData']) => Wrapper<V>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mountFactory(component: any, options: QuasarMountOptions = {}) {
  return (propsData?: QuasarMountOptions['propsData']) =>
    mountQuasar(component, {
      ...options,
      propsData: { ...options.propsData, ...propsData }
    });
}

/**
 * Injections for Components with a QPage root Element
 */
export function qLayoutInjections() {
  return {
    pageContainer: true,
    layout: {
      header: {},
      right: {},
      footer: {},
      left: {}
    }
  };
}

export function ssrContextMock() {
  return {
    req: {
      headers: {}
    },
    res: {
      setHeader: () => undefined
    }
  };
}

export function setCookies(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cookies: Record<string, any>,
  ssrContext?: QSsrContext
) {
  const cookieStorage = ssrContext ? Cookies.parseSSR(ssrContext) : Cookies;
  Object.entries(cookies).forEach(([key, value]) => {
    cookieStorage.set(key, value);
  });
}
