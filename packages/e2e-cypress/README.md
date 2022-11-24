## [Cypress](https://www.cypress.io/)

> You’re looking at Quasar v2 testing docs. If you're searching for Quasar v1 docs, head [here](https://github.com/quasarframework/quasar-testing/tree/qv1/packages/e2e-cypress/)

> You’re looking at Cypress AE v5 (Cypress 11) docs. If you're searching for Cypress AE v4 (Cypress 9) docs, head [here](https://github.com/quasarframework/quasar-testing/tree/cypress-v4/packages/e2e-cypress)

```shell
$ yarn quasar ext add @quasar/testing-e2e-cypress@beta
```

Add into your `.eslintrc.js` the following code:

```js
{
  // ...
  overrides: [
    {
      files: ['**/*.cy.{js,jsx,ts,tsx}'],
      extends: [
        // Add Cypress-specific lint rules, globals and Cypress plugin
        // See https://github.com/cypress-io/eslint-plugin-cypress#rules
        'plugin:cypress/recommended',
      ],
    },
  ],
}
```

---

This App Extension (AE) manages Quasar and Cypress integration for you, both for JavaScript and TypeScript.

Some custom commands are included out-of-the-box:

| Name                                       | Usage                                                                                                                                                                       | Description                                                                                                                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataCy`                                   | `cy.dataCy('my-data-id')`                                                                                                                                                   | Implements the [selection best practice](https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements) which avoids brittle tests, is equivalent to `cy.get('[data-cy=my-data-id]')` |
| `testRoute`                                | `cy.testRoute('home')` <br /> `cy.testRoute('books/*/pages/*')`                                                                                                             | Tests if the current URL matches the provided string using [`minimatch`](https://docs.cypress.io/api/utilities/minimatch). Leading `#`, if using router hash mode, and `/` are automatically prepended.  |
| `saveLocalStorage`                         | `cy.saveLocalStorage()`                                                                                                                                                     | Save local storage data to be used in subsequent tests                                                                                                                                                   |
| `restoreLocalStorage`                      | `cy.restoreLocalStorage()`                                                                                                                                                  | Restore previously saved local storage data                                                                                                                                                              |
| `within[Portal\|Menu\|SelectMenu\|Dialog]` | `cy.withinSelectMenu(() => cy.get('.q-item').first().click())` <br /> `cy.withinDialog({ dataCy: 'add-action-dialog', fn() { /* business haha */ } });`                     | Auto-scope commands into the callback within the Portal-based component and perform assertions common to all of them.                                                                                    |
| `should('have.[color\|backgroundColor]')`  | `cy.get('foo').should('have.color', 'white')` <br /> `cy.get('foo').should('have.backgroundColor', '#000')` <br /> `cy.get('foo').should('have.color', 'var(--q-primary)')` | Provide a couple color-related custom matchers, which accept any valid CSS color format.                                                                                                                 |

You must have a running dev server in order to run integration tests. The scripts added by this AE automatically take care of this: `yarn test:e2e` and `yarn test:e2e:ci` will launch `quasar dev` when starting up the tests and kill it when cypress process ends.

This AE is a wrapper around Cypress, you won't be able to use this or understand most of the documentation if you haven't read [the official documentation](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html).

**Cypress Component Testing** is supported and the AE scaffolds the code to run both "e2e" and "component" tests with Cypress.
As for "e2e" tests, you'll need to first take a look to their [official documentation](https://docs.cypress.io/guides/component-testing/writing-your-first-component-test), or you won't understand many of the concepts described into this documentation.
Consequentially, we may rename this package from `@quasar/quasar-app-extension-testing-e2e-cypress` to `@quasar/quasar-app-extension-testing-cypress` in a future release.

### Code coverage

We support scaffolding [code coverage configuration for Cypress tests](https://docs.cypress.io/guides/tooling/code-coverage), when using Vite-based Quasar CLI.

To generate reports, run `test:e2e:ci` and/or `test:component:ci` scripts.
Running them both sequentially within the same command (eg. `yarn test:e2e:ci && yarn test:component:ci`) will result in combined coverage report.
You'll find the generated report into `coverage/lcov-report` folder.

We provide a [preset configuration](https://github.com/quasarframework/quasar-testing/blob/dev/packages/e2e-cypress/nyc-config-preset.json) for the coverage report which:

- enables `all` option to include some files which are ignored by default:
  - dynamically imported components, such as layout and pages imported by vue-router;
  - files not touched by any test.
- excludes test folders (`__tests__`) and TS declaration files (\*.d.ts), which should already be excluded [by default](https://github.com/istanbuljs/schema/blob/master/default-exclude.js) but apparently aren't;
- only includes actual code files, leaving out code-like static assets (eg. svgs).

Check out [nyc official documentation](https://github.com/istanbuljs/nyc) if you want to customize report generation.
You can either add options into `.nycrc` file or generate reports on the fly running `nyc report <options>`.

> Note that we do not setup [Istanbul TS configuration](https://github.com/istanbuljs/istanbuljs/tree/master/packages/nyc-config-typescript) and its dependencies as Cypress claims [it's able to manage TS code coverage out-of-the-box](https://github.com/cypress-io/code-coverage#typescript-users).
> Some TS files may be excluded by the report in scenarios, eg. if they aren't actually imported (dead code), if they're tree-shaked away by a bundler or if they only contain types/interfaces, and as such have no actual JS representation.
> Please open an issue if you notice some files are missing from generated reports in this scenario.

### Upgrade from Cypress AE v4

> if you're coming from v3, follow [the migration guide for v4 and v4.1 first](https://github.com/quasarframework/quasar-testing/tree/cypress-v4/packages/e2e-cypress#upgrade-from-cypress-v4-to-v41-optional)

All changes are related to Cypress v10 breaking changes, Quasar first-party helpers haven't been changed unless Cypress required it.

Alternatively to the following guide, a faster but more error-prone way for advanced developers would be to run `yarn quasar ext add @quasar/testing-e2e-cypress@beta` and `yarn add -D cypress`, then let the package scaffold new files overriding the existing ones and manually merge your changes into the generated files. Even in this case, we suggest to take a look to the following migration guide and use it as a checklist, as some files must be renamed/removed.

Here's all the steps you need to take while upgrading from v4 to v5:

- upgrade to v5, then install `cypress` dependency, which has been externalized and marked as a peerDependency

```sh
yarn upgrade @quasar/quasar-app-extension-testing-e2e-cypress@beta
yarn add -D cypress
```

- if your project is Webpack-based install Typescript as dev dependency, as Cypress won't correctly detect your project as a TS one unless the dependency is present in your `package.json`. You can remove the dependency at the end of this migration guide, as `@quasar/app-webpack` already provides it for you.

```sh
yarn add -D typescript
```

- run `yarn cypress open` and follow the guided procedure
- select "component testing" option and accept all proposed steps. When prompted for it, if autodetection doesn't kick in, select `vue` framework and `webpack`/`vite` bundler accordingly to what you're using. Note that, after the migration wizard completes, Cypress is expected to display an error due to it's inability to run Quasar devServer out-of-the-box
- if a duplicated `component` property is generated into `cypress.config.[js|ts]`, remove the one containting `devServer` property.
- remove from `test/cypress/plugins/index.[js|ts]` the code used to inject the component dev server, and add it into `cypress.config.[js|ts]` as

```ts
import { injectQuasarDevServerConfig } from '@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server';

export default defineConfig({
  // ...
  component: {
    devServer: injectQuasarDevServerConfig(),
  },
});
```

- create a `test/cypress/support/component-index.html` file with [this content](./src/templates/base/test/cypress/support/component-index.html)
- set `component.test/cypress/support/component-index.html` property into `cypress.config.[js|ts]` to `test/cypress/support/component-index.html`
- replace all `mount` occurrences to use the new `cy.mount()` helper instead
- set `component.specPattern` property to `src/**/*.cy.{js,jsx,ts,tsx}` and update all your component tests names to match that pattern, replacing `.spec` with `.cy`
- rename `test/cypress/integration` folder to `test/cypress/e2e` and update `e2e.specPattern` accordingly
- rename `test/cypress/support/index.[js|ts]` to `test/cypress/support/e2e.[js|ts]` and update `e2e.supportFile` property accordingly
- update your `test:e2e` and `test:e2e:ci` scripts to use `--e2e` flag (`open --e2e` and `run --e2e` respectively)
- update your `test:component` and `test:component:ci` scripts to use `--component` flag instead of `open-ct`/`run-ct` commands (`open --component` and `run --component` respectively)
- remove Cypress JSON schema registration from vscode settings, Cypress switched to a JS/TS config file and is now using an helper function to provide autocomplete.
- update eslint override pattern which applies to cypress files as explained into this AE installation instructions
- (optional) move any other custom configuration from `test/cypress/plugins/index.[js|ts]` to [`setupNodeEvents` hooks](https://docs.cypress.io/guides/references/configuration#History) into `cypress.config.[js|ts]`. Note that if you're using Vite and you added code coverage, you'll need to setup code coverage plugin both into e2e and component `setupNodeEvents` hooks
- check out [Cypress 10 changelog](https://docs.cypress.io/guides/references/changelog#10-0-0) and [Cypress 11 changelog](https://docs.cypress.io/guides/references/changelog#11-0-0), and see if something else in there affect you

### Caveats

#### Automatic override of Cypress commands

Many Cypress commands rely on the presence of a native DOM inputs, but many Quasar input components won't usually render them for better performance, or will use them under the hood, but hide them to the user.

This resulted in a bad DX for some Cypress commands/assertions when used on some Quasar input components, so we patched those Cypress commands/assertions on our side.
Here's the list of patched methods and some limitations due to the override:

- `.select()`
  - it won't yeld anything;
  - when dealing with a multiple QSelect, it will only select the provided options, it won't deselect the ones not specified;
  - since option value isn't mirrored into the DOM when using QSelect, it's not possible to select options based on the option value;
  - it will ignore the original command options (eg `force: true`).
- `.check` / `.uncheck`
  - it won't yeld anything;
  - it won't accept parameters;
- `.should('be.checked')` / `.should('not.be.checked')`
  - no limitations.

Feel free to open a PR if you want to help removing these limitations.

#### QSelect and `data-cy`

QSelect automatically apply unknown props to an inner element of the component, including `data-cy`.
This means that you need to use `cy.dataCy('select').closest('.q-select')` to get the actual root element of the component.
While this isn't important when clicking the select to open its options menu, it is if you're checking any of its attributes (eg. `aria-disabled` to see if it's enabled or not)

You can define an helper to access a QSelect element, here's an example:

```ts
function dataCySelect(dataCyId: string) {
  return cy.dataCy(dataCyId).closest('.q-select');
}
```

Additionally, when using `use-input` prop, the `data-cy` is mirrored on the inner native `select` too.
This can generate confusion as `cy.dataCy('select')` in those cases will return a collection and you'll need to use `.first()` or `.last()` to get respectively the component wrapper or the native input.

### Component Testing Caveats

This AE aims to be as lightweight as possible to reduce maintenance burden.
That's why we currently don't provide our own helpers to manage VueRouter, Vuex and Pinia.

The good news is that we don't actually need to, since official documentation for those libraries is already available:

- [VueRouter](https://docs.cypress.io/guides/component-testing/custom-mount-vue#Vue-Router)
- [Vuex](https://docs.cypress.io/guides/component-testing/custom-mount-vue#Vuex)
- [Pinia](https://pinia.vuejs.org/cookbook/testing.html#unit-testing-components)

### Testing the AE

```sh
cd test-project-webpack # or "cd test-project-vite" or "cd test-project-app"
yarn sync:cypress # or "yarn sync:all", if it's the first time you run this command
yarn test:e2e:ci # check if e2e tests still work with the local version of the AE
yarn test:component:ci # check if component tests still work with the local version of the AE
```
