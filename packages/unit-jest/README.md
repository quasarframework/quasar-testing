## [Jest](https://jestjs.io/)

> You're looking at Quasar v1 Jest AE docs. While the AE migration to support Quasar v2 is in progress, you can find the documentation for Quasar v2 version [here](https://github.com/quasarframework/quasar-testing/tree/next/packages/unit-jest)

```shell
$ quasar ext add @quasar/testing-unit-jest
```

This AE is meant to manage Quasar and Jest integration for you, both for JS and TS.

We have included:

- a preset configuration file (`jest.config.js`);
- a setup file with some common patterns you may want to enable (`/test/jest/jest.setup.js`);
- `mountQuasar` and `mountFactory` helpers which wrap mount functions from "@vue/test-utils";
- two example components (`App.spec` using Vue native `mount` helper, `QBtnDemo` using `mountQuasar` and [Double File Component](#double-file-components-dfc) fashion);
- some useful `package.json` scripts;
- Babel integration;
- TypeScript support.

This AE is a wrapper around official "@vue/test-utils" package, you won't be able to use this or understand most of the documentation if you haven't read [the official documentation](https://vue-test-utils.vuejs.org/).

### mountQuasar(component, options)

Quasar packs quite a lot of features and configuring correctly `mount`/`shallowMount` to work on Quasar CLI projects isn't trivial.
This function incapsulates the configuration needed to bring you up-and-running.

Usage:

```ts
import { mountQuasar } from '@quasar/quasar-app-extension-testing-unit-jest';
import { QBtn } from 'quasar'; // <= cherry pick only the components you actually use
import BookComponent from './BookComponent'; // <= note the absence of `.vue` extension, here we are importing the JS/TS part of a Double File Component

describe('BookComponent', () => {
  test('mounts without errors', () => {
    const wrapper = mountQuasar(BookComponent, {
      quasar: {
        components: {
          QBtn,
        },
      },
      propsData: {
        prop1: 'value',
      },
    });

    expect(wrapper).toBeTruthy();
  });
});
```

The second parameter accepts a configuration object with the following properties:

| Name             | Type                                                       | Default                                   | Description                                                                                                                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mount`          | Object                                                     | `{}`                                      | The [configuration object](https://vue-test-utils.vuejs.org/api/options.html#context) you'd usually provide to `mount` or `shallowMount` helpers                                                                                                                             |
| `mount.type`     | `full` or `shallow`                                        | `shallow`                                 | Determine which mount helper should be used between `mount` or `shallowMount`                                                                                                                                                                                                |
| `mount.localVue` | Vue instance                                               | Clean instance by `createLocalVue` helper | Same as corresponding [mount option](https://vue-test-utils.vuejs.org/api/options.html#localvue), except it generates a new one automatically if not provided. Most of the time you won't need to specify it                                                                 |
| `quasar`         | Object                                                     | None                                      | Quasar plugin configuration options, you'll mainly use this to register Quasar components to stub                                                                                                                                                                            |
| `propsData`      | Object                                                     | None                                      | Initial props for the component, will be merged (with precedence) with `mount.propsData`                                                                                                                                                                                     |
| `plugins`        | Array of `VuePlugin` or `[VuePlugin, ...VuePluginOptions]` | `[]`                                      | Vue plugins which must be added to the localVue instance (eg. `VueCompositionAPI`). If your plugin needs options, you can provide it as an array where the first element is the plugin itself and following elements are the options (eg. `[VueCompositionAPI, ...options]`) |

### mountFactory(component, options)

Most of the time `mountQuasar` configuration will be the same for all tests inside a test-suite, while initial props will change.
`mountFactory` addresses this scenario: it accepts the same parameters as `mountQuasar`, but returns a function accepting a `propsData` object and returning a wrapper instance.

Usage:

```ts
import { mountFactory } from '@quasar/quasar-app-extension-testing-unit-jest';
import { QBtn } from 'quasar'; // <= cherry pick only the components you actually use
import BookshelfComponent from './BookshelfComponent'; // <= note the absence of `.vue` extension, here we are importing the JS/TS part of a Double File Component

const factory = mountFactory(BookshelfComponent, {
  // mount: { type: 'full' } <= uncomment this line to use `mount`; `shallowMount` is used by default as it will stub all **registered** components found into the template
  quasar: { components: { QBtn } },
});

describe('BookshelfComponent', () => {
  test('mounts without errors', () => {
    const wrapper = factory(); // <= when no props are needed
    // const wrapper = factory({ propName: propValue }); <= when props are needed
    expect(wrapper).toBeTruthy();
  });
});
```

### AE Options

#### SFC Test code block

We have included the optional ability to place your test code inside your vue files, should you choose to do so. It will be rendered by webpack HMR. To run these tests, run `$ quasar test --unit jest --dev` (requires you to use `@quasar/app-extension-testing` to manage testing harnesses).

```vue
<test lang="jest">
  /* your complete test file here */
</test>
```

##### Syntax highlighting

You may notice that your IDE doesn't know how to parse the test block. Follow the instructions below to enable syntax highlighting and/or autocomplete in your specific IDE.

###### Webstorm

- Go to the `<test/>` block, press `<Alt> + <Enter>`
- Select `inject language or reference`
- Then select `javascript`
  - This will grant `<test/>` blocks autocomplete

###### VS Code

The [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) VS Code extension is required.
If you don't already have the Vetur extension installed:

- Launch VS Code Quick Open (`<Ctrl> + <P>`)
- Paste the following command `ext install octref.vetur` then press `<Enter>`

Once you have the Vetur extension installed, you need to configure the custom code block in Vetur.

- Press `<Ctrl> + <Comma>` to launch the _settings editor_ window
- In the search field type `Custom Blocks` to narrow the focus down to `Vetur > Grammar > Custom Blocks`
- Click `Edit in settings.json`
  - This will populate the settings file with the existing configuration block and we will add the following:

```json5
  "vetur.grammar.customBlocks": {
    "test": "js",
    // ... existing block definitions
  }
```

_Note: If you're using TypeScript you can set the language to `ts` instead of `js`._

- Save the changes to `settings.json` (`<Ctrl> + <S>`)
- Launch _'Show All Commands'_ (`<Ctrl> + <Shift> + <P>` or `F1`) and paste `Vetur: Generate grammar` then press `<Enter>`
  - This will regenerate the Vetur grammar file to include the new custom block definition
- Launch _'Show All Commands'_ again (`<Ctrl> + <Shift> + <P>` or `F1`) and paste `Reload Window` then press `<Enter>`
  - This will reload VS Code and apply the new syntax highlighting

---

#### Wallaby.js

You can choose to install Wallaby.js to do inline testing. Although it is not freeware, it is an amazing tool and comes highly recommended. https://wallabyjs.com

#### Majestic

You can choose to install Majestic, which is a UI interface to see how your tests are doing. https://github.com/Raathigesh/majestic

### Caveats

#### Mock i18n

If you're using `VueI18n`, you may want to mock translations. You can easily create Jest mocks for all translation functions and provide them into `options.mocks`.

```ts
import { mountFactory } from '@quasar/quasar-app-extension-testing-unit-jest';
import BookshelfComponent from './BookshelfComponent';

const $t = jest.fn();
$t.mockReturnValue(''); // <= will always provide an empty string
const $tc = jest.fn();
const $n = jest.fn();
const $d = jest.fn();

const factory = mountFactory(BookshelfComponent, {
  mount: {
    mocks: { $t, $tc, $n, $d },
  },
});

describe('BookshelfComponent', () => {
  // ...
});
```

#### Testing QPage components

`QPage` usually only work when placed inside a `QLayout` component because the latter provide some references to other layout components.
You can use `qLayoutInjections` helper function to get an injection stub which will allow you to test `QPage`s in isolation.

```ts
import {
  mountFactory,
  qLayoutInjections,
} from '@quasar/quasar-app-extension-testing-unit-jest';
import BookshelfPage from './BookshelfPage';

const factory = mountFactory(BookshelfPage, {
  mount: {
    provide: qLayoutInjections(),
  },
});

describe('BookshelfPage', () => {
  // ...
});
```

#### Use with VueRouter

You can use VueRouter adding it to a custom `localVue` instance you later provide into `options.mount.localVue`.

```ts
import { mountFactory } from '@quasar/quasar-app-extension-testing-unit-jest';
import VueRouter from 'vue-router';
import BookshelfPage from './BookshelfPage';
import { createLocalVue } from '@vue/test-utils';

const localVue = createLocalVue();
localVue.use(VueRouter);

const factory = mountFactory(BookshelfPage, {
  mount: {
    localVue,
    router: new VueRouter(),
  },
});

describe('BookshelfPage', () => {
  // ...
});
```

#### Use with Vuex

You can use Vuex adding it to a custom `localVue` instance you later provide into `options.mount.localVue`.

```ts
import { mountFactory } from '@quasar/quasar-app-extension-testing-unit-jest';
import Vuex from 'vuex';
import BookshelfPage from './BookshelfPage';
import { createLocalVue } from '@vue/test-utils';

const localVue = createLocalVue();
localVue.use(Vuex);

const factory = mountFactory(BookshelfPage, {
  mount: {
    localVue,
    store: new Vuex.Store({}),
  },
});

describe('BookshelfPage', () => {
  // ...
});
```

#### SSR context

You could need an SSR context if your component uses `Cookies` plugin, `Platform` plugin or `preFetch` feature and you want to test how it behaves into SSR mode. In those cases, you can get a mock via `ssrContextMock`.

#### Cookies

If you're testing `Cookies` usage into your app, you can use `setCookies` helper function. \
If the test involves SSR mode, you can use `ssrContextMock` helper function to get a mock of the SSR context and provide it to `setCookies`.

```ts
import {
  getCookies,
  ssrContextMock,
} from '@quasar/quasar-app-extension-testing-unit-jest';

const cookies = {
  // ...
};

setCookies(cookies);
setCookies(cookies, ssrContextMock());
```

#### TypeScript limitations

There are a couple of limitations due to Vue and TS incompabilities.
These limitations also affect JS users to some degree, as under-the-hood code autocomplete is powered by TypeScript.

##### Double File Components (DFC)

TypeScript cannot infer a component type from a SFC, because it cannot understand the content of files which are not JS or TS.
To allow correct inference of the component type, you shall separate the `<script>` tag content of your SFC into a standalone file, adopting a DFC (Double File Component) fashion.

```ts
// BookComponent.ts
export default {
  name: 'BookComponent',
  // ...
};
```

```html
<!-- BookComponent.vue -->
<script lang="ts" src="./book-component.ts"></script>

<template></template>

<style scoped></style>
```

##### `propsData` autocomplete

The configuration object `propsData` property isn't currently typed after the component instance props.
This is due to Vue components complicated typings and multiple flavours, as we still haven't found the way to both extract props typings AND get a correctly typed wrapper instance for all flavours: Composition, Class and Options API all have different and partially incompatible types.
We are open to contributions and will try to solve this problem when switching to Vue 3, which should have easier typings.

#### Jest watch mode

`jest --watch` will not work if you don't have a version control system (Git, Mercurial) in place, as jest relies on it to track which files should be watched for changes.
Alternatively you can use `jest --watchAll`, but be aware there will be a performance impact and you should ignore all folders not containing tests into your Jest configuration.
