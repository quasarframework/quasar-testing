## [Vitest](https://vitest.dev/)

```shell
$ quasar ext add @quasar/testing-unit-vitest
```

> Since Vitest 0.34 onwards relies on Vite 4 types, while `@quasar/app-vite` v1 still relies on Vite 2, you'll need to set your `resolutions` (if using Yarn) or `overrides` (if using NPM or PNPM) fields like the following to avoid type mismatch errors:
>
> ```json
> "resolutions": {
>   "@vitejs/plugin-vue": "^4.0.0",
>   "vite": "^4.0.0"
> },
> ```

> This package is in **alpha** phase. The public API may still change as we collect community feedback.

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
