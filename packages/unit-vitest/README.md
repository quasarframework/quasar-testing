## [Vitest](https://vitest.dev/)

```shell
$ quasar ext add @quasar/testing-unit-vitest@beta
```

> This package is in **beta** phase. The public API is unlikely to change much before the stable release.
> It will be released as stable once `@quasar/app-vite@v2` will hit a stable release.

This App Extension (AE) manages Quasar and Vitest integration for you, both for JavaScript and TypeScript.

What is included:

- a Vite config file with Quasar configure (`vitest.config.ts`);
- an `installQuasarPlugin` function to help you setup and configure the test Quasar instance on a per-test-suite basis;
- some examples about how to use it with Pinia and Vue Router;
- some example components and related example tests inside `test/vitest/__tests__`
- some useful `package.json` scripts;
- TypeScript support.

This AE is a lightweight add-on to "@vue/test-utils" package, which helps you test Vue components that rely on some Quasar features.
Please check out ["@vue/test-utils" official documentation](https://vue-test-utils.vuejs.org/) to learn how to test Vue components.

If you're migrating from Jest to Vitest, please check out the official [migration guide](https://vitest.dev/guide/migration.html#migrating-from-jest).

### Upgrade from Vitest AE v0.4 to v1.0 onwards

All changes are related to Vitest v1.0 breaking changes, Quasar first-party helpers haven't changed.

- Upgrade Node to v18 or newer, v20 is preferred due to some quirks in v18;
- Upgrade all Vitest related dependencies, especially `@vue/test-utils`, `vitest` and `@vitest/ui`, which minimum peer dependencies versions has been bumped. If you don't want to upgrade these dependencies manually, you can just re-install the AE and it will update all dependencies for you;
- (**optional**) Upgrade `vue` and `quasar` dependencies to the latest version;
- Rename `vitest.config.[js|ts]` to `vitest.config.[mjs|mts]` or switch your project to "ESM by default" adding `"type": "module"` option in `package.json`. Check out [here](https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated) why CJS build and syntax are deprecated in Vite 5;
- Vitest 1.0 requires Vite 5, thus you'll need to upgrade `@quasar/app-vite` to v2 (currently in alpha stage). If you can't migrate away from v1 yet, you can use this [workaround](https://github.com/quasarframework/quasar/issues/14077#issuecomment-1851463530) until you can migrate. We do test against the setup using that workaround, to ease the migration, but bear in mind that we don't consider it as "officially supported" and we will stop testing against it in the near future;
- Follow Vitest [upgrade guide](https://vitest.dev/guide/migration.html#migrating-from-vitest-0-34-6) to upgrade from Vitest v34.6 to v1.0

### installQuasarPlugin(options)

Call this helper at the top of your test files. It will configure `@vue/test-utils` to setup Quasar plugin every time `mount`/`shallowMount` is called.
It will also restore the original configuration after all tests completed.

Usage:

````ts
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import ExampleComponent from '../ExampleComponent.vue';

/*
 * You can provide a config object as param like such:
 *
 * ```ts
 * installQuasarPlugin({ plugins: { Dialog } });
 * ```
 */
installQuasarPlugin();

describe('ExampleComponent', () => {
  it('should mount correctly', async () => {
    mount(ExampleComponent, {});
  });
});
````

### Caveats

Here're some helpers which has not been included in the current AE version, but could be in future versions

#### Mocking Vue Router

https://github.com/posva/vue-router-mock

```ts
import { beforeEach } from 'vitest';
import {
  createRouterMock,
  injectRouterMock,
  VueRouterMock,
  RouterMockOptions,
} from 'vue-router-mock';
import { config } from '@vue/test-utils';

// https://github.com/posva/vue-router-mock
export function installRouter(options?: RouterMockOptions) {
  beforeEach(() => {
    const router = createRouterMock(options);
    injectRouterMock(router);
  });

  config.plugins.VueWrapper.install(VueRouterMock);
}
```

#### Mocking Pinia

```ts
// install-pinia.ts

import { config } from '@vue/test-utils';
import { cloneDeep } from 'lodash-es';
import { beforeAll, afterAll } from 'vitest';
import { createTestingPinia, TestingOptions } from '@pinia/testing';
import { Plugin } from 'vue';

export function installPinia(options?: Partial<TestingOptions>) {
  const globalConfigBackup = cloneDeep(config.global);

  beforeAll(() => {
    config.global.plugins.unshift(
      // This is needed because typescript will complain othwerwise
      // Probably due to this being a monorepo as this same setup inside a test project did work correctly
      createTestingPinia(options) as unknown as Plugin,
    );
  });

  afterAll(() => {
    config.global = globalConfigBackup;
  });
}
```

```ts
// example-store.ts

import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    counter: 0,
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    increment() {
      this.counter++;
    },
  },
});
```

```vue
<!-- StoreComponent.vue -->

<template>
  <div>
    {{ counter }}
    <q-btn @click="store.increment"> Increment </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useCounterStore } from './example-store';

const store = useCounterStore();

const counter = computed(() => store.counter);
</script>
```

```ts
// StoreComponent.test.ts

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { useCounterStore } from '../example-store';
import { describe, expect, it } from 'vitest';
import { installPinia } from './install-pinia.ts';
import StoreComponent from './StoreComponent.vue';

// Documentation: https://pinia.vuejs.org/cookbook/testing.html#unit-testing-a-store

installQuasarPlugin();
installPinia({ stubActions: false });

describe('store examples', () => {
  it('should increment the counter', async () => {
    const wrapper = mount(StoreComponent);
    const store = useCounterStore();
    expect(wrapper.text()).toContain(0);
    const btn = wrapper.get('button');
    expect(store.increment).not.toHaveBeenCalled();
    await btn.trigger('click');
    expect(store.increment).toHaveBeenCalled();
    expect(wrapper.text()).toContain(1);
    expect(store.counter).toBe(1);
  });
});
```

### Testing the AE

```sh
cd test-project-vite
yarn sync:vitest # or "yarn sync:all", if it's the first time you run this command
yarn test:unit:ci # check if unit tests still work with the local version of the AE
```
