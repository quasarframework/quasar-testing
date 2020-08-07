import { createLocalVue, shallowMount, mount } from "@vue/test-utils";
import { Cookies, Quasar } from "quasar";

function createLocalVueForQuasar({ quasar, plugins }) {
  const localVue = createLocalVue();

  // Quasar skips installation if it already went through it, but this applies to different Vue instances too
  // Here we reset the installation flag to allow the plugin to be correctly installed on another Vue instance
  Quasar.__qInstalled = undefined;
  localVue.use(Quasar, quasar);

  (plugins ?? []).forEach(pluginDescriptor => {
    if (!Array.isArray(pluginDescriptor)) {
      pluginDescriptor = [pluginDescriptor];
    }

    const [plugin, ...options] = pluginDescriptor;
    localVue.use(plugin, ...options);
  });

  // (options.bootFunctions ?? []).forEach(bootFn => {
  //   bootFn({ app, store, router, Vue: localVue, ssrContext });
  // });

  return localVue;
}

// We cannot infer component type from `shallowMount` using `Parameters<typeof shallowMount>`
//  because it has overloads but the last signature isn't the most general one, while `Parameters<...>`
//  will automatically resolve to the last signature thinking it's the most generic one.
// See https://github.com/Microsoft/TypeScript/issues/24275#issuecomment-390701982
export function mountQuasar(component, options = {}) {
  const localVue = options.mount?.localVue ?? createLocalVueForQuasar(options);

  const mountFn = options.mount?.type === "full" ? mount : shallowMount;

  // mount functions usually require a Vue component,
  //  but due to Jest extensions resolution we get them
  //  working even when we provide only the script part
  // See https://github.com/vuejs/vue-jest/issues/188
  return mountFn(component, {
    ...options.mount,
    propsData: { ...options.mount?.propsData, ...options.propsData },
    localVue,
  });
}

export function mountFactory(component, options = {}) {
  if (!options.mount || !options.mount.localVue) {
    options.mount = {
      ...options.mount,
      localVue: createLocalVueForQuasar(options)
    };
  }

  return (propsData) =>
    mountQuasar(component, {
      ...options,
      propsData: { ...options.propsData, ...propsData },
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
      left: {},
    },
  };
}

export function ssrContextMock() {
  return {
    req: {
      headers: {},
    },
    res: {
      setHeader: () => undefined,
    },
  };
}

export function setCookies(cookies, ssrContext) {
  const cookieStorage = ssrContext ? Cookies.parseSSR(ssrContext) : Cookies;
  Object.entries(cookies).forEach(([key, value]) => {
    cookieStorage.set(key, value);
  });
}
