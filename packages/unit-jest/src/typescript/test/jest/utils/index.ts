import VueCompositionApi from '@vue/composition-api';
import { createLocalVue, shallowMount, mount, Wrapper } from '@vue/test-utils';
import { Cookies, Quasar, QuasarPluginOptions } from 'quasar';
import Vue, { ComponentOptions, PluginObject } from 'vue';

/**
 * Utility type to declare an extended Vue constructor
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VueClass<V extends Vue> = (new (...args: any[]) => V) & typeof Vue;

/**
 * `mountQuasar` options interface
 */
interface QuasarMountOptions {
  // @vue/test-utils "mount" and "shallowMount" options signature are the same on v1.0.3
  // If they'll diverge in future, it should be possible to model a discriminated union over "shallow" property
  // TODO: remove Quasar-managed mount options from this type
  mount?: {
    shallow?: boolean;
  } & Parameters<typeof mount>[1];
  quasar?: Partial<QuasarPluginOptions>;
  ssr?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cookies?: Record<string, any>;
  // TODO: due to Vue components overcomplicated typings and multiple flavours it doesn't seem possible
  //  to both extract props typings AND get a correctly typed wrapper instance
  // Composition, Class and Options API all have different and partially incompatible types
  // We'll check if the situation gets better with Vue3 typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propsData?: Record<string, any>;
  plugins?: PluginObject<any>[];
}

const mockSsrContext = () => {
  return {
    req: {
      headers: {}
    },
    res: {
      setHeader: () => undefined
    }
  };
};

// https://eddyerburgh.me/mock-vuex-in-vue-unit-tests
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
  const localVue = createLocalVue();

  localVue.use(Quasar, options.quasar);
  (options.plugins ?? []).forEach(plugin => localVue.use(plugin));

  // TODO: Vuex and VueRouter not available on localVue instance, must be reported
  // See https://forum.quasar-framework.org/topic/3461/quasar-testing-vue-warn-error-in-render-typeerror-cannot-read-property-lang-of-undefined/7
  // localVue.use(Vuex);
  // localVue.use(VueRouter);
  // const store = new Vuex.Store({});
  // const router = new VueRouter();

  if (options) {
    const ssrContext = options.ssr ? mockSsrContext() : null;

    if (options.cookies) {
      const cookieStorage = ssrContext ? Cookies.parseSSR(ssrContext) : Cookies;
      const cookies = options.cookies;
      Object.entries(cookies).forEach(([key, value]) => {
        cookieStorage.set(key, value);
      });
    }
  }

  // mock vue-i18n
  const $t = jest.fn();
  const $tc = jest.fn();
  const $n = jest.fn();
  const $d = jest.fn();

  // If 'mount.shallow' exists and is false, we use full 'mount'
  // Otherwise the fallback is 'shallowMount'
  const mountFn = options.mount?.shallow === false ? mount : shallowMount;

  // mount functions usually require a
  // See https://github.com/vuejs/vue-jest/issues/188
  return mountFn<V>(component, {
    propsData: options.propsData,
    localVue,
    // store,
    // router,
    mocks: { $t, $tc, $n, $d },
    // Injections for Components with a QPage root Element
    provide: {
      pageContainer: true,
      layout: {
        header: {},
        right: {},
        footer: {},
        left: {}
      }
    }
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
    mountQuasar(component, { ...options, propsData });
}
