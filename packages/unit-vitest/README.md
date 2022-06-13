## [Vitest](https://vitest.dev/)

```shell
$ quasar ext add @quasar/testing-unit-vitest@alpha
```

> This package is in **alpha** phase. The public API may still change as we collect community feedback.

This App Extension (AE) manages Quasar and Vitest integration for you, both for JavaScript and TypeScript.

What is included:

- a Vite config file with Quasar configure (`vitest.config.ts`);
- an `installQuasarPlugin` function to help you setup and configure the test Quasar instance on a per-test-suite basis;
- an `installPiniaPlugin` function to setup and configure the use of Pinia store on a per-test-suite basis;
- some example components and related example tests inside `src/components/__examples__`
- some useful `package.json` scripts;
- TypeScript support.

This AE is a lightweight add-on to "@vue/test-utils" package, which helps you test Vue components that rely on some Quasar features.
Please check out ["@vue/test-utils" official documentation](https://vue-test-utils.vuejs.org/) to learn how to test Vue components.

### installQuasarPlugin(options)

Call this helper at the top of your test files. It will configure `@vue/test-utils` to setup Quasar plugin every time `mount`/`shallowMount` is called.
It will also restore the original configuration after all tests completed.

Usage:

````ts
import ExampleComponent from '../ExampleComponent.vue';
import { mount } from '@vue/test-utils';
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest';

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
