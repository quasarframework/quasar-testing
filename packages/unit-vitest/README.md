## [Vitest](https://vitest.dev/)

```shell
$ npm quasar ext add @quasar/testing-unit-vitest
# or
$ yarn quasar ext add @quasar/testing-unit-vitest
# or
$ pnpm quasar ext add @quasar/testing-unit-vitest
```

For ESLint < v9, add into your `.eslintrc.js` the following code:

```js
{
  // ...
  overrides: [
    {
      files: [
        'src/**/*.vitest.{test,spec}.{js,jsx,ts,tsx}',
        'test/vitest/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      rules: {
        // Allow chai-style assertions, e.g. `expect(foo).to.be.true`
        '@typescript-eslint/no-unused-expressions': 'off',
      },
    },
  ],
}
```

For ESLint v9 onwards, add into your `eslint.config.js` the following code:

```js
export default [
  // ...
  {
    name: 'custom/vitest',

    files: [
      'src/**/*.vitest.{test,spec}.{js,jsx,ts,tsx}',
      'test/vitest/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    rules: {
      // Allow chai-style assertions, e.g. `expect(foo).to.be.true`
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
```

This App Extension (AE) manages Quasar and Vitest integration for you, both for JavaScript and TypeScript.

What is included:

- a Vite config file with Quasar configure (`vitest.config.ts`, or `vitest.config.js` for JavaScript projects);
- a `quasarViteTestingConfig` function which derives the Vitest config from your quasar.config file;
- an `installQuasarPlugin` function to help you setup and configure the test Quasar instance on a per-test-suite basis;
- some examples about how to use it with Pinia and Vue Router;
- some example components and related example tests inside `test/vitest/__tests__`
- some useful `package.json` scripts;
- TypeScript support.

This AE is a lightweight add-on to "@vue/test-utils" package, which helps you test Vue components that rely on some Quasar features.
Please check out ["@vue/test-utils" official documentation](https://vue-test-utils.vuejs.org/) to learn how to test Vue components.

If you're migrating from Jest to Vitest, please check out the official [migration guide](https://vitest.dev/guide/migration.html#migrating-from-jest).

### Upgrade from Vitest AE v2.x to v3.0 onwards

Quasar first-party helpers haven't changed. The AE now requires `@quasar/app-vite` v3 and derives the Vitest config from your real quasar.config file. It supports both Vitest v4 and v5.

- Upgrade `@quasar/app-vite` to v3. If you can't migrate away from v2 yet, stay on AE v2.x;
- Upgrade Node to v22.12.0 or newer;
- The config file is now named `vitest.config.[ts|js]` instead of `vitest.config.[mts|mjs]`: app-vite v3 projects are ESM by default, so the `m` prefix is no longer needed. Rename yours, and make sure only one of the two exists;
- Re-install the AE (`quasar ext add @quasar/testing-unit-vitest`) and accept file overrides, or update your Vitest config file manually to the new format based on [`quasarViteTestingConfig(options)`](#quasarvitetestingconfigoptions);
- `vite-tsconfig-paths` is removed as it's not needed in Vite 8, ensure you don't depend on it for any other reason.

### Upgrade from Vitest AE v1.x to v2.0 onwards

Quasar first-party helpers haven't changed.
All changes are related to Vitest v4.0 breaking changes or ecosystem deprecations.

- Upgrade Node to v20.19.0 or newer, v22.12.0 or newer is preferred. These versions have been chosen because they enable the `require(esm)` feature by default, which many packages (e.g. `happy-dom`) rely on;
- (**optional**) Upgrade `typescript` to v5.8 or later, which supports the `require(esm)` feature;
- (**optional**) Upgrade `vue` and `quasar` dependencies to the latest version;
- Upgrade `@quasar/app-vite` to v2.4 or later, which uses Vite 7;
- Upgrade all Vitest related packages, in particular `vitest` and `@vitest/ui`, to v4.0 or later. If you don't want to upgrade these dependencies manually, you can just re-install the AE and it will update all dependencies for you. Vitest v1, v2 and v3 are no longer supported;
- Follow the Vitest [migration guide](https://vitest.dev/guide/migration#vitest-4) to upgrade from Vitest v3 to v4. If you are on Vitest v1 or v2, upgrade through the intermediate majors' migration guides first;

### Upgrade from Vitest AE v0.4 to v1.0 onwards

All changes are related to Vitest v1.0 breaking changes, Quasar first-party helpers haven't changed.

- Upgrade Node to v18 or newer, v20 is preferred due to some quirks in v18;
- Upgrade all Vitest related dependencies, especially `@vue/test-utils`, `vitest` and `@vitest/ui`, which minimum peer dependencies versions has been bumped. If you don't want to upgrade these dependencies manually, you can just re-install the AE and it will update all dependencies for you;
- (**optional**) Upgrade `vue` and `quasar` dependencies to the latest version;
- Rename `vitest.config.[js|ts]` to `vitest.config.[mjs|mts]` or switch your project to "ESM by default" adding `"type": "module"` option in `package.json`. Check out [here](https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated) why CJS build and syntax are deprecated in Vite 5;
- Vitest 1.0 requires Vite 5, thus you'll need to upgrade `@quasar/app-vite` to v2. If you can't migrate away from v1 yet, you can use this [workaround](https://github.com/quasarframework/quasar/issues/14077#issuecomment-1851463530) until you can migrate. We do test against the setup using that workaround, to ease the migration, but bear in mind that we don't consider it as "officially supported" and we will stop testing against it in the near future;
- Follow Vitest [upgrade guide](https://vitest.dev/guide/migration.html#migrating-from-vitest-0-34-6) to upgrade from Vitest v34.6 to v1.0

### quasarViteTestingConfig(options)

Call this helper in your `vitest.config.[ts|js]` file. It returns your app's Vite config, built from your quasar.config file by `@quasar/app-vite`, without the dev-server-only plugins (`vite-plugin-checker` and `vite-plugin-vue-devtools`). Merge your test options on top of it:

```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { quasarViteTestingConfig } from '@quasar/quasar-app-extension-testing-unit-vitest/config';

export default defineConfig(async () =>
  mergeConfig(await quasarViteTestingConfig(), {
    test: {
      /* your test options */
    },
  }),
);
```

The `excludePlugins` option adjusts the plugin filtering:

- `{ excludePlugins: ['plugin-name'] }` removes more plugins that shouldn't run during tests;
- `{ excludePlugins: (defaults) => defaults.filter((name) => name !== 'vite-plugin-vue-devtools') }` keeps a plugin that is removed by default;
- `{ excludePlugins: () => [] }` disables the plugin filtering.

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

### Simulate Quasar component Event

Here is a way to simulate a Quasar event emission, for example from a QDialog or a QSelect

```ts
const findPopup = () => wrapper.findComponent('[data-testid="my-popup"]');
await findPopup().vm.$emit('accept');

const findSelect = () => wrapper.findComponent({ ref: 'my-select' });
await findSelect().vm.$emit('update:model-value', 'a choice');
```

### QTooltip

For QTooltip and other components existing in a specific Quasar div, they cant be analysed by vitest.

### QIcon

When mounted, a QIcon fetch the image corresponding to his name. But if you use materialize extra and dont inject it in Quasar test instance, that can be simplier to test directly for text of QIcon

```ts
expect(findCloseButton().text()).toBe('close');
```

### Snapshot

When using Snapshot, keep in mind that some Quasar component generate UIDs that can break snapshot.
Most of the time, adding a for attribute to the component fix the generated snapshot.
But if this is not working (for example for QBtnDropDown), you can also stub the component in order to fix the snapshot.

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
cd test-vite-app-v3
yarn sync:vitest # or "yarn sync:all", if it's the first time you run this command
yarn test:unit:ci # check if unit tests still work with the local version of the AE
```
