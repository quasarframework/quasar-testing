## [Jest](https://jestjs.io/)

```shell
$ quasar ext add @quasar/testing-unit-jest@alpha
```

> This package is in `alpha` phase, the public API may still change as we collect the community feedback.
> Notice that we rely on `vue-test-utils` (currently in RC phase) and `vue-jest` (currently in alpha phase) and may not release the `stable` version of this package until those packages are released as `stable` too

This AE is meant to manage Quasar and Jest integration for you, both for JS and TS.

We have included:

- a preset configuration file (`jest.config.js`);
- an `installQuasarPlugin` function to help you setup and configure the test Quasar instance on a per-test-suite basis;
- an example component (`MyButton.vue`) and related example test (`MyButton.spec`);
- some useful `package.json` scripts;
- Babel integration;
- Majestic integration;
- TypeScript support.

This AE is a lightweight add-on to "@vue/test-utils" package, which helps you test Vue components which rely on some Quasar features.
Please check out ["@vue/test-utils" official documentation](https://vue-test-utils.vuejs.org/) to learn how to test Vue components.

### Upgrade from Jest AE v2 / Quasar v1

#### Goodbye `mountQuasar`/`mountFactory`, hello `installQuasarPlugin`

Since the new VTU `mount` helper comes with improved typings and supports out-of-the-box many options of the old `mountQuasar`, the existence of a Quasar-specific helpers don't quite make sense anymore.

They have been replaced by the `installQuasarPlugin` helper, which you should call at the very top of your test files.

#### Import Jest helpers from `@jest/globals` (Optional, but recommended)

We suggest you to switch from Jest globals to their ESM-imported counterparts (especially if you use TypeScript), as this will avoid the global scope pollution and simplify integrating Jest with other testing tools.
If you choose to proceed on this path, then:

- Uninstall Jest global types running `yarn remove @types/jest`
- Remove `jest` value from `compilerOptions.types` property into `tsconfig.json`. If only `quasar` remains in that array, remove `compilerOptions.type` altogether as it's already provided by `@quasar/app/tsconfig-preset`
- Update all your test files to import all globals you need from `@jest/globals` package, eg. `import { describe, expect, jest, it, test } from "@jest/globals"`
- Check out [Vue Test Utils 2.0 migration guide](https://next.vue-test-utils.vuejs.org/migration/)

#### Misc

- Remove `"esModuleInterop": true` from `tsconfig.json`, as Vue Test Utils now supports tsconfig `extends` property and will infer `esModuleInterop` value from `@quasar/app/tsconfig-preset`
- If you never touched `test/jest/jest.setup` file since you installed this AE, you can now safely delete it and the related `setupFilesAfterEnv` property into `jest.config.js`. It's main purpose was to apply a `Promise` polyfill, which isn't needed anymore due to the new minimum Node version being v12
- Remove `'^quasar$'`, `'^vue$'` and `'^test-utils$'` mappings from your `jest.config.js`, if present, as they're not needed anymore

#### Removed options and WIP features

We removed some nice-to-have options present in the old AE version in order to release sooner a first public alpha for you to try out.
Some of them will come back with time, some others were pretty clunky and won't probably be migrated.

As far as we know, **the ability to add tests directly into the SFC** isn't really used, as it still requires an intermediate step to extract those tests into `.spec` files anyway.
We don't plan to migrate it, unless many people ask for it and someone from the community steps up to enhance this feature DX.

**Wallaby support** has been dropped. We plan to explore this feature again in some time, but a better path would be to discuss with Wallaby team for them to integrate Quasar CLI into their own [automatic configurator](https://wallabyjs.com/docs/intro/config.html#automatic-configuration) as is already the case for other CLIs.

**setCookies** helper has been temporarly removed, but we plan to add it back

### installQuasarPlugin(options)

Call this helper at top of your test files, it will configure `@vue/test-utils` to setup Quasar plugin every time `mount`/`shallowMount` is called.
It will also restore the original configuration after all tests completed.

Usage:

````ts
import { describe, expect, it } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount } from '@vue/test-utils';
import BookComponent from './BookComponent.vue';

/*
 * You can provide a config object as param like such:
 *
 * ```ts
 * installQuasarPlugin({ plugins: { Dialog } });
 * ```
 */
installQuasarPlugin();

describe('BookComponent', () => {
  it('mounts without errors', () => {
    const wrapper = mount(MyButton);

    expect(wrapper).toBeTruthy();
  });
});
````

### AE Options

#### Majestic

You can choose to install [Majestic](https://github.com/Raathigesh/majestic), which is a UI interface to see how your tests are doing.

### Caveats

#### Mock i18n

If you're using `vue-i18n`, you may want to mock translations. You can easily create Jest mocks for all translation functions and provide them into `options.mocks`.

```ts
import { describe, it, jest } from '@jest/globals';
import { config, mount } from '@vue/test-utils';
import BookshelfComponent from './BookshelfComponent';

const $t = jest.fn();
$t.mockReturnValue(''); // <= will always return an empty string

// Global mock
config.global.mocks.$t = $t;

describe('BookshelfComponent', () => {
  it('should mount with translations mock', () => {
    // Local mock
    const wrapper = mount(BookshelfComponent, {
      global: { mocks: { $t } },
    });

    // ...
  });
});
```

#### Testing QPage components

`QPage` usually only work when placed inside a `QLayout` component because the latter provide some references to other layout components.
You can use `qLayoutInjections` helper function to get stubs you can provide to allow you to test `QPage`s in isolation.

```ts
import { qLayoutInjections } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount } from '@vue/test-utils';
import BookshelfPage from './BookshelfPage';

describe('BookshelfPage', () => {
  it('should mount a page with mocked layout', () => {
    const wrapper = mount(BookshelfPage, {
      global: { provide: qLayoutInjections() },
    });

    // ...
  });
});
```

#### TypeScript limitations

There are a couple of limitations due to Vue and TS incompabilities.
These limitations also affect JS users to some degree, as under-the-hood code autocomplete is powered by TypeScript.

##### Double File Components (DFC)

TypeScript cannot infer a component type from a SFC, because it cannot understand the content of files which are not JS or TS.
To allow correct inference of the component type, you shall separate the `<script>` tag content of your SFC into a standalone file, adopting a DFC (Double File Component) fashion.

```ts
// BookComponent.ts
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BookComponent',
  // ...
});
```

```html
<!-- BookComponent.vue -->
<script lang="ts" src="./book-component.ts"></script>

<template></template>

<style scoped></style>
```

#### Jest watch mode

`jest --watch` will not work if you don't have a version control system (Git, Mercurial) in place, as jest relies on it to track which files should be watched for changes.
Alternatively you can use `jest --watchAll`, but be aware there will be a performance impact and you should ignore all folders not containing tests into your Jest configuration.
