## [Jest](https://jestjs.io/)

> You’re looking at Quasar v2 testing docs. If you're searching for Quasar v1 docs, head [here](https://github.com/quasarframework/quasar-testing/tree/qv1/packages/unit-jest/)

```shell
$ quasar ext add @quasar/testing-unit-jest@alpha
```

> This package is in **alpha** phase. The public API may still change as we collect community feedback.
> Notice that we rely on "@vue/test-utils" (VTU, currently in RC phase) and "vue-jest" (currently in alpha phase) and may not release the **stable** version of this package until those packages are released as **stable** too.

This App Extension (AE) manages Quasar and Jest integration for you, both for JavaScript and TypeScript.

What is included:

- a preset configuration file (`jest.config.js`);
- an `installQuasarPlugin` function to help you setup and configure the test Quasar instance on a per-test-suite basis;
- some example components (eg. `MyButton.vue`) and related example test (eg. `MyButton.spec.[js|ts]`);
- some useful `package.json` scripts;
- Babel integration;
- Majestic integration;
- TypeScript support.

This AE is a lightweight add-on to "@vue/test-utils" package, which helps you test Vue components that rely on some Quasar features.
Please check out ["@vue/test-utils" official documentation](https://vue-test-utils.vuejs.org/) to learn how to test Vue components.

### installQuasarPlugin(options)

Call this helper at the top of your test files. It will configure `@vue/test-utils` to setup Quasar plugin every time `mount`/`shallowMount` is called.
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

### Upgrade from Jest AE v2 / Quasar v1

#### Goodbye `mountQuasar`/`mountFactory`, hello `installQuasarPlugin`

The new VTU `mount` helper comes with improved typings and extended features, thus Quasar-specific helpers, like `mountQuasar`, don't quite make sense anymore.

They have been replaced by the `installQuasarPlugin` helper, which you should call at the very top of your test files.

#### Import Jest helpers from `@jest/globals` (Optional\*, but recommended)

We suggest you switch from Jest globals to their ESM-imported counterparts (especially if you use TypeScript), as this will avoid global scope pollution and simplify integrating Jest with other testing tools.
If you choose to proceed on this path, then:

- Uninstall Jest global types running `yarn remove @types/jest`
- Remove `jest` value from `compilerOptions.types` property into `tsconfig.json`. If only `quasar` remains in that array, remove `compilerOptions.types` altogether, as it's already provided by [`src/quasar.d.ts`](https://github.com/quasarframework/quasar-starter-kit/blob/b206de59d87b8adcc25a8f7863cfe705bf6b3741/template/src/quasar.d.ts) shim
- Update all your test files to import all globals you need from `@jest/globals` package, eg. `import { describe, expect, jest, it, test } from "@jest/globals"`

\*= If you're using Cypress AE `^4.0.0-beta.7` this step is required to avoid type and linting conflicts

#### Misc

- Check out [Vue Test Utils 2.0 migration guide](https://next.vue-test-utils.vuejs.org/migration/)
- If you've never touched `test/jest/jest.setup` file since you installed this AE, you can now safely delete it and the related `setupFilesAfterEnv` property into `jest.config.js`. Its main purpose was to apply a `Promise` polyfill, which isn't needed anymore due to the new minimum Node version being v12
- Remove `'^vue$'` and `'^test-utils$'` mappings into your `jest.config.js`, if present, as they're not needed anymore
- Add/update `'^quasar$'` mapping into your `jest.config.js` to `quasar/dist/quasar.esm.prod.js` and add `quasar` into the `esModules` array in the same file. Quasar v2 CJS build is tailor-made for SSR, so the ESM one must be used
- If you're using TypeScript
  - update your vue-shims file to match https://github.com/quasarframework/quasar-starter-kit/blob/master/template/src/shims-vue.d.ts
  - remove `"esModuleInterop": true` from `tsconfig.json`, as Vue Test Utils now supports tsconfig `extends` property and will infer `esModuleInterop` value from `@quasar/app/tsconfig-preset`
  - enable [`isolatedModules` option](https://huafu.github.io/ts-jest/user/config/isolatedModules#example) to cut dramatically your tests first execution time. Skip this step if you're using `const enum` in your code

#### Removed options and WIP features

We removed some nice-to-have options present in the old AE version in order to release a first public alpha for you to try out.
Some of them will come back with time, some others were pretty clunky and won't probably be migrated.

As far as we know, **the ability to add tests directly into the SFC** isn't really used, as it still requires an intermediate step to extract those tests into `.spec` files anyway.
We don't plan to migrate it, unless many people ask for it and someone from the community steps up to enhance this feature DX.

**Wallaby support** has been dropped. We plan to explore this feature again in some time, but a better path would be to discuss with Wallaby team for them to integrate Quasar CLI into their own [automatic configurator](https://wallabyjs.com/docs/intro/config.html#automatic-configuration) as is already the case for other CLIs.

**ssrContextMock** helper has been dropped to discourage testing components in SSR mode: many Quasar components aren't meant to work in that environment or work partially/have a different behaviour. If you think you have some legit use cases for this feature, please reach back to us by opening an issue.

**setCookies** helper has been temporarly removed, but we plan to add it back.

### Caveats

#### Testing portal-based components

Portal-based component (eg. QMenu, QDialog, etc) require a `body` so that they can attach themselves to the document.

Vue Test Utils provides a DOMWrapper that allows you to mount the document body, and access the document for testing
purposes. The example provided in `MyDialog.spec.js` demonstrates how this can be implemented.

However, if this does not work for your specific use case, the recommended way of testing these components with Jest is
to abstract them into their own component and test them in isolation.

Note that, if you end up trying to test interactions between multiple components, you are probably trying to test an
e2e/integration scenario using a unit testing tool.
Take a look to our Cypress AE instead: it supports proper Component Testing since version `4.0.0-beta.7` and may be what
you're searching for.

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

`QPage` usually only works when placed inside a `QLayout` component, because the latter provides some references to other layout components.
You can use `qLayoutInjections` to get stubs of those references, then you should provide them while mounting the component.
This will allow you to test `QPage`s in isolation.

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

#### TypeScript

##### Type-checking disabled by default

This AE ships with project-level type-checking disabled by default since it increases dramatically the first run time, and the performance penality increases as the project grows. If you want to re-enable it (eg. because you need to use `const enum`), switch `globals.ts-jest.isolatedModules` to `false` into `jest.config.js`.

Project-wide type-checking already takes place during development and into your IDE, so you won't usually need this during tests too anyway.

##### Double File Components (DFC)

There are a couple of limitations due to Vue and TS incompabilities.
These limitations also affect JS users to some degree, as under-the-hood code autocomplete is powered by TypeScript.

TypeScript cannot infer a component type from an SFC, because it cannot understand the content of files which are not JavaScript or TypeScript.
To allow correct inference of the component type, you should separate the `<script>` tag content of your SFC into a standalone file, adopting a DFC (Double File Component) fashion.

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
Alternatively you can use `jest --watchAll`, but be aware there will be a performance impact and you should ignore all folders not containing tests in your Jest configuration.
