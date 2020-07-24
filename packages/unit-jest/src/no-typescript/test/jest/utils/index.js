import { createLocalVue, shallowMount, mount } from '@vue/test-utils';
import { Cookies, Quasar } from 'quasar';

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
export function mountQuasar(component, options = {}) {
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

  // mount functions works even if we are providing only the controller path
  //  thanks to the extensions resolution order we provided into Jest configuration
  // See https://github.com/vuejs/vue-jest/issues/188
  return mountFn(component, {
    ...options.mount,
    propsData: options.propsData,
    localVue,
    // store,
    // router,
    mocks: { $t, $tc, $n, $d, ...options.mount?.mocks },
    // Injections for Components with a QPage root Element
    provide: {
      pageContainer: true,
      layout: {
        header: {},
        right: {},
        footer: {},
        left: {}
      },
      ...options.mount?.inject
    }
  });
}

export function mountFactory(component, options = {}) {
  return propsData => mountQuasar(component, { ...options, propsData });
}
