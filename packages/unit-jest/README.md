# [Jest](https://jestjs.io/)

```shell
$ quasar ext add @quasar/testing-unit-jest
```

This AE is meant to manage Quasar and Jest integration for you, both for JS and TS.

We have included:

- a preset configuration file (`jest.config.js`);
- a setup file with some common pattern you may want to enable (`/test/jest/jest.setup.js`);
- `mountQuasar` and `mountFactory` helpers which wraps `mount`/`shallowMount` "@vue/test-utils";
- two example components (`App.spec` using Vue native `mount` helper, `QBtnDemo` using `mountQuasar` and DFC fashion);
- some useful `package.json` scripts;
- Babel integration;
- TypeScript support.

## mountQuasar(component, options)

Quasar packs quite a lot of features and configuring correctly `mount`/`shallowMount` to work on Quasar CLI projects isn't trivial.
This function incapsulate the configuration needed to bring you up-and-running.

Usage:

```ts
import { mountQuasar } from "app/test/jest/utils";
import { QBtn } from "quasar"; // <= cherry pick only the components you actually use
import BookComponent from "./BookComponent"; // <= note the absence of `.vue` extension, here we are importing the JS/TS part of a Double File Component

describe("BookComponent", () => {
  test("mounts without errors", () => {
    const wrapper = mountQuasar(BookComponent, {
      quasar: {
        components: {
          QBtn,
        },
      },
      propsData: {
        prop1: "value",
      },
    });

    expect(wrapper).toBeTruthy();
  });
});
```

The second parameter accepts a configuration object with the following properties

- `mount` (object): the configuration object you'd usually provide to `mount` or `shallowMount` helpers;
- `mount.shallow` (boolean): determine which mount helper should be used between `mount` or `shallowMount`, the latter is used by default;
- `quasar` (object): Quasar plugin configuration options, you'll mainly use this to register the Quasar components which must be stubbed;
- `ssr` (boolean): wheter SSR mocks shall be added or not;
- `cookies` (object): provide cookies which must be present while testing;
- `propsData` (object): initial props of the component;
- `plugins` (array): Vue plugins which must be added to the localVue instance (eg. `Vuex`, `VueRouter`, `VueCompositionApi`, etc).

## mountFactory(component, options)

Most of the times `mountQuasar` configuration will be the same for all tests inside a test-suite, while initial props will change.
`mountFactory` address this scenario: it accepts the same parameters as `mountQuasar`, but returns a function accepting a `propsData` object and returning a wrapper instance.

Usage:

```ts
import { mountFactory } from "app/test/jest/utils";
import { QBtn } from "quasar"; // <= cherry pick only the components you actually use
import BookshelfComponent from "./BookshelfComponent"; // <= note the absence of `.vue` extension, here we are importing the JS/TS part of a Double File Component

const factory = mountFactory(BookshelfComponent, {
  // mount: { shallow: false } <= uncomment this line to use `mount`; `shallowMount` is used by default as it will stub all **registered** components found into the template
  quasar: { components: { QBtn } },
});

describe("BookshelfComponent", () => {
  test("mounts without errors", () => {
    const wrapper = factory(); // <= when no props are needed
    // const wrapper = factory({ propName: propValue }); <= when props are needed
    expect(wrapper).toBeTruthy();
  });
});
```

## AE Options

We have included the optional ability to place your test code inside your vue files, should you choose to do so. It will be rendered by webpack HMR. To run these tests, run `$ quasar test --unit jest --dev` (require you to use `@quasar/app-extension-testing` to manage testing harnesses).

```
<test lang="jest">
  /* your complete test file here */
</test>
```

You can choose to install Wallaby.js to do inline testing. Although it is not freeware, it is an amazing tool and comes highly recommended. https://wallabyjs.com

You can choose to install Majestic, which is a UI interface to see how your tests are doing. https://github.com/Raathigesh/majestic

## Caveats

### TypeScript limitations

There are a couple of limitations due to Vue and TS incompabilities.
These limitations also affect JS users to some degree, as under-the-hood code autocomplete is powered by TypeScript.

#### Double File Components (DFC)

TypeScript cannot infer a component type from a SFC, because it cannot understand the content of files which are not JS or TS.
To allow correct inference of the component type, you shall separate the `<script>` tag content of your SFC into a standalone file, adopting a DFC (Double File Component) fashion.

```ts
// BookComponent.ts
export default {
  name: "BookComponent",
  // ...
};
```

```html
<!-- BookComponent.vue -->
<script lang="ts" src="./book-component.ts"></script>

<template></template>

<style scoped></style>
```

#### `propsData` autocomplete

The configuration object `propsData` property isn't currently typed after the component instance props.
This is due to Vue components complicated typings and multiple flavours, as we still haven't found the way to both extract props typings AND get a correctly typed wrapper instance for all flavours: Composition, Class and Options API all have different and partially incompatible types.
We are open to contributions and will try to solve this problem when switching to Vue 3, which should have easier typings.

### Jest watch mode

`jest --watch` will not work if you don't have a version control system (Git, Mercurial) in place, as jest relies on it to track which files should be watched for changes.
Alternatively you can use `jest --watchAll`, but be aware there will be a performance impact and you should ignore all folders not containing tests into your Jest configuration.

### Custom <test> blocks autocomplete and syntax highlight

You may notice that your IDE doesn't know how to parse the test blocks into your SFCs.
To fix this:

- go into a `<test/>` block;
- press your quickfix shortcut (`<alt> + <enter>`, `<ctrl> + <.>` or whichever your IDE provides you);
- select "inject language or reference"
- select `javascript`.

This will grant `<test/>` blocks autocomplete and syntax highlight.
