## [Jest](https://jestjs.io/)

> **[Jest isn't compatible with Vite](https://github.com/quasarframework/quasar-testing/issues/244#issuecomment-1293671738)**, if you use `@quasar/app-vite` and you need unit testing, you should use [Vitest](../unit-vitest/README.md) instead.

> This package is in **beta** phase. The public API shouldn't change before the stable release.

> **We're looking for a maintainer!**
> Currently no one in the Quasar team is using Jest in his day-to-day life, thus we miss many use cases and the DX is suboptimal.
> We're looking for someone who is using it and would like to help us maintain this package.
> **If you're interested, please reach out on [Discord](https://chat.quasar.dev/)**

```shell
$ quasar ext add @quasar/testing-unit-jest@beta
```

Add into your `.eslintrc.js` the following code:

```js
{
  // ...
  overrides: [
    {
      files: ["**/*.{js,ts}"],
      // If the `script` part of a Vue component is stored in a separate JS/TS file,
      // as is the case when using DFC (https://testing.quasar.dev/packages/unit-jest/#double-file-components-dfc),
      // Vue ESLint plugin will highlight all public properties as unused
      // as it's not able to detect their usage into the template
      // We disable this rule and only keep it for Vue files
      rules: { "vue/no-unused-properties": "off" },
    },
    {
      files: [
        '**/test/jest/__tests__/**/*.{spec,test}.{js,jsx,ts,tsx}',
        '**/*.jest.{spec,test}.{js,jsx,ts,tsx}',
      ],
      env: {
        browser: true,
      },
      extends: [
        // Removes 'no-undef' lint errors for Jest global functions (`describe`, `it`, etc),
        //  add Jest-specific lint rules and Jest plugin
        // See https://github.com/jest-community/eslint-plugin-jest#recommended
        'plugin:jest/recommended',
        // Uncomment following line to apply style rules
        // 'plugin:jest/style',
      ],
    },
  ],
}
```

---

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

> This package had a long alpha phase due to narrow bandwidth on Quasar team to care about it as much as it was needed.
> When the first alpha release took place the active Jest version was v26, while at the time of the beta release it bumped to v29.
> We decided to update directly to Jest v29 before releasing the beta of this package.
> The suggested path to migrate projects using v3 alpha release of this package is to re-read and apply the migration guide which has been updated to account for new changes.

Alternatively to the following guide, a faster way for advanced developers would be to run `yarn quasar ext add @quasar/testing-unit-jest@beta` and `yarn add -D jest @vue/test-utils eslint-plugin-jest@latest`, then let the package scaffold new files overriding the existing ones and manually merge your changes into the generated files. Ensure to have version control in place to be able to revert if needed. Even in this case, we suggest to take a look to the following migration guide and use it as a checklist, as some files must be renamed/removed.

**Please note that Jest v29 requires Node v14, thus this package can only be used with Node 14 or higher.**

#### Dependencies externalization, upgrade and removal

We adapted to the ecosystem shift towards externalizing dependencies, we now manage supported versions of third parties packages via peerDependencies.
Run `yarn add -D jest @vue/test-utils` to install previously bundled dependencies.

Run `yarn add -D @quasar/quasar-app-extension-testing-unit-jest@beta eslint-plugin-jest@latest` to upgrade dependencies which were already externalized.

Here are some resources which you should read, adapting your tests accordingly:

- [Jest 26 to 27](https://jestjs.io/blog/2021/05/25/jest-27)
- [Jest 27 to 28](https://jestjs.io/docs/28.x/upgrading-to-jest28)
- [Jest 28 to 29](https://jestjs.io/docs/upgrading-to-jest29)
- [Vue Test Utils 2.0 migration guide](https://next.vue-test-utils.vuejs.org/migration/)

Here are some resources which you should read only if you still have errors after having applied this guide steps:

- [Vue Test Utils releases](https://github.com/vuejs/test-utils/releases?page=2). Users upgrading from this package alpha release should check release changelogs from v2.0.0-rc.11 onwards.
- [Vue Jest releases](https://github.com/vuejs/vue-jest/releases). Users upgrading from this package alpha release should check release changelogs from v27.0.0-alpha.2 onwards.
- [TS Jest changelog](https://github.com/kulshekhar/ts-jest/blob/HEAD/CHANGELOG.md). Users upgrading from this package alpha release should check release changelogs from v26.5.6 onwards.

We removed some dependencies and scripts which didn't really prove to be that much useful:

- `concurrently` package and related `'concurrently:dev:jest'` script: if you were using them in any way, add the package back in your project by running `yarn add -D concurrently`, otherwise remove the related script from your `package.json`.
- `jest-serializer-vue` package: it's not compatible with Vue 3. Feel free to help [upstream efforts](https://github.com/eddyerburgh/jest-serializer-vue/issues/49) to catch up if you need this feature. There's also a more advanced [fork](https://github.com/tjw-lint/jest-serializer-vue-tjw) with the same problem.
- `serve:test:coverage` script: it probably never actually worked as intended, check out https://github.com/quasarframework/quasar-testing/issues/97#issuecomment-1289054992 for an explanation about its problems, you can still run `quasar serve test/jest/coverage/lcov-report/ --port 8788` manually and we'll try to re-add it back in a future release.

#### Goodbye `mountQuasar`/`mountFactory`, hello `installQuasarPlugin`

The new VTU `mount` helper comes with improved typings and extended features, thus Quasar-specific helpers, like `mountQuasar`, don't quite make sense anymore.

They have been replaced by the `installQuasarPlugin` helper, which you should call at the very top of your test files.

#### Import Jest helpers from `@jest/globals` (Optional\*, but **strongly** recommended)

We suggest you switch from Jest globals to their ESM-imported counterparts (especially if you use TypeScript), as this will avoid global scope pollution and simplify integrating Jest with other testing tools.
If you choose to proceed on this path, then:

- Uninstall Jest global types running `yarn remove @types/jest`
- Remove `jest` value from `compilerOptions.types` property into `tsconfig.json`. If only `quasar` remains in that array, remove `compilerOptions.types` altogether, as it's already provided by [`src/quasar.d.ts`](https://github.com/quasarframework/quasar-starter-kit/blob/b206de59d87b8adcc25a8f7863cfe705bf6b3741/template/src/quasar.d.ts) shim
- Update all your test files to import all globals you need from `@jest/globals` package, eg. `import { describe, expect, jest, it, test } from "@jest/globals"`

\*= If you're using other testing frameworks (e.g. Cypress) this step is required to avoid type and linting conflicts

#### Simplified Jest configuration

We moved most of Jest configuration needed to integrate Jest with Quasar into `@quasar/quasar-app-extension-testing-unit-jest` preset.
Upgrade your `jest.config.js` to be a `.mjs` file, then update its content to match the [TS configuration](./src/templates/typescript/jest.config.mjs) or [JS configuration](./src/templates/no-typescript/jest.config.mjs), depending on your needs, and integrate any custom configuration you had.

When in need of extending the preset, you can import it and cherry-pick the properties you need to extend like such:

```ts
import { config } from '@quasar/quasar-app-extension-testing-unit-jest/jest-preset.mjs';

const { transform } = config;

export default {
  // ... other config properties
  transform: {
    ...transform,
    // Add your custom transform here
  },
};
```

If you've never touched `test/jest/jest.setup` file since you installed this AE, you can now safely delete it: its main purpose was to apply a `Promise` polyfill, which isn't needed anymore due to the new minimum Node version being v14.
If you actually added custom code there, add `setupFilesAfterEnv` property into your updated `jest.config.mjs` to reference it.

#### TypeScript support

- update your vue-shims file to match https://github.com/quasarframework/quasar-starter-kit/blob/master/template/src/shims-vue.d.ts
- remove `"esModuleInterop": true` from `tsconfig.json`, as Vue Test Utils now supports tsconfig `extends` property and will infer `esModuleInterop` value from Quasar TS config preset

#### Miscellaneous

We removed "Babel config" prompt as latest Quasar projects already come with Babel presets to detect Node environment and adapt Babel configuration accordingly.
Make sure your Quasar packages are up-to-date and your `babel.config.js` matches [latest available version](https://github.com/quasarframework/quasar/blob/dev/create-quasar/templates/app/quasar-v2/ts-webpack/BASE/babel.config.js). You can remove any pre-existing `.babelrc` file generated by this AE.

If your codebase is written in JavaScript, you'll need to update `babel.config.js` to match [this version](https://github.com/quasarframework/quasar-testing/blob/dev/packages/unit-jest/src/templates/no-typescript/babel.config.js) instead.

Remove eslint configuration into `test/jest` and add an override into the root eslint config as explained as explained into this AE installation instructions.

#### Removed options and WIP features

We removed some nice-to-have options present in the old AE version which increased the maintenance effort.
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
purposes. The example provided in `MyDialog.spec.[ts/js]` demonstrates how this can be implemented.

However, if this does not work for your specific use case, the recommended way of testing these components with Jest is
to abstract them into their own component and test them in isolation.

Note that, if you end up trying to test interactions between multiple components, you are probably trying to test an
e2e/integration scenario using a unit testing tool.
Take a look to our Cypress AE instead: it supports proper Component Testing since v4 and may be what you're searching for.

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

This AE ships with project-level type-checking disabled by default since it increases dramatically the first run time, and the performance penality increases as the project grows. If you want to re-enable it (eg. because you need to use `const enum`), switch `isolatedModules` option of `ts-jest` transformer to `false` into `jest.config.mjs`.

Project-wide type-checking already takes place during development and into your IDE, so you won't usually need this during tests anyway.

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

### Testing the AE

```sh
cd test-project-webpack # or "cd test-project-app"
yarn sync:jest # or "yarn sync:all", if it's the first time you run this command
yarn test:unit:ci # check if unit tests still work with the local version of the AE
```
