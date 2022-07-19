## [Cypress](https://www.cypress.io/)

> You’re looking at Quasar v2 testing docs. If you're searching for Quasar v1 docs, head [here](https://testing.quasar.dev/packages/e2e-cypress/)

```shell
$ quasar ext add @quasar/testing-e2e-cypress
```

Add into your `.eslintrc.js` the following code:

```js
{
  // ...
  overrides: [
    {
      files: ['**/*.spec.{js,ts}'],
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
As for "e2e" tests, you'll need to first take a look to their (official documentation)[https://docs.cypress.io/guides/component-testing/writing-your-first-component-test], or you won't understand many of the concepts described into this documentation.
Consequentially, we may rename this package from `@quasar/quasar-app-extension-testing-e2e-cypress` to `@quasar/quasar-app-extension-testing-cypress` in a future release.

### Code coverage

Since v4.1 onwards, we support scaffolding [code coverage configuration for Cypress tests](https://docs.cypress.io/guides/tooling/code-coverage), when using Vite-based Quasar CLI.

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

### Upgrade from Cypress v4 to v4.1 (optional)

If you need code-coverage or want to adapt, rerun `quasar ext add @quasar/testing-e2e-cypress` and select the appropriate options.
If you want adapt to latest defaults, either rerun `quasar ext add @quasar/testing-e2e-cypress` or:

- If they exist, update `test:unit` and `test:unit:ci` scripts to `test:component` and `test:component:ci`, to avoid clashes with actual unit tests from other packages.
- If they exist, prefix `test:component` and `test:component:ci` scripts with `cross-env NODE_ENV=test`. Update related command into `quasar.testing.json` too.
- If they exist, update `test:e2e` and `test:e2e:ci` scripts to use `cross-env NODE_ENV=test` instead of `cross-env E2E_TEST=true`. Update related command into `quasar.testing.json` too. Usage of `E2E_TEST` is deprecated and will be removed into next major version.

### Upgrade from Cypress AE v3 / Quasar v1

- Replace the code for Quasar custom commands into `test/cypress/support/commands.[js/ts]` with following lines, as they're now exported directly by the package

```ts
// DO NOT REMOVE
// Imports Quasar Cypress AE predefined commands
import { registerCommands } from '@quasar/quasar-app-extension-testing-e2e-cypress';
registerCommands();
```

- remove the ["'ResizeObserver loop limit exceeded'" fix](https://github.com/quasarframework/quasar/issues/2233#issuecomment-492975745) into `test/cypress/support/index.[js/ts]` as we now apply it automatically when registering commands

- Update your usages of `testRoute` command, as it's now using [`Cypress.minimatch`](https://docs.cypress.io/api/utilities/minimatch) instead of just checking if the hash/pathname contains the provided string.

```ts
// URL to match: shelfs/123/books

// OLD way, too general:
testRoute('shelfs');
// or
testRoute('books');
// or even
testRoute('123/books');

// NEW way
testRoute('shelfs/*/books');
```

- Since Jest can now be used without global types and Cypress can run its own component tests (which in many scenarios can replace Jest unit testing), Cypress configuration for TS codebases can be simplified:

  - remove `test/cypress/tsconfig.json` and consequentially `parserOptions` option into `test/cypress/.eslintrc.js`
  - remove `"test/cypress"` value from `exclude` option of root `tsconfig.json`. If only `"/dist", ".quasar", "node_modules"` values remains in that array, remove `exclude` option altogether, as it's already provided by `@quasar/app/tsconfig-preset`

- remove `test/cypress/.eslintrc.js` and move its content into your root `.eslintrc.js`, targeting spec files with `overrides`. If you haven't changed the file scaffolded from a previous version, it should be as simple as copy/pasting this configuration

```js
{
  // ...
  overrides: [
    {
      files: ['**/*.spec.{js,ts}'],
      extends: [
        // Add Cypress-specific lint rules, globals and Cypress plugin
        // See https://github.com/cypress-io/eslint-plugin-cypress#rules
        'plugin:cypress/recommended',
      ],
      // ... other custom Cypress-related configuration
    },
  ],
}
```

- We went through many Cypress major versions during this AE beta phase, Cypress v6 was the latest version supported by Qv1 AE, please check out [Cypress 7](https://docs.cypress.io/guides/references/migration-guide#Migrating-to-Cypress-7-0) and [Cypress 8](https://docs.cypress.io/guides/references/migration-guide#Migrating-to-Cypress-8-0) migration guides and adapt your code accordingly. Also check out the changelog for [Cypress 9](https://docs.cypress.io/guides/references/changelog#9-0-0)

- If you're using TypeScript, update your vue-shims file to match https://github.com/quasarframework/quasar-starter-kit/blob/master/template/src/shims-vue.d.ts

### Caveats

#### Automatic override of Cypress commands

Many Cypress commands rely on the presence of a native DOM inputs, but many Quasar input components won't usually render them for better performance, or will use them under the hood, but hide them to the user.

This resulted in a bad DX for some Cypress commands/assertions when used on some Quasar input components.

Since v4.2, we patch those Cypress commands/assertions on our side.
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

On versions < v4.2, follow these steps:

- you must set `name` attribute to force Quasar to add the underlying native inputs;
- if you need to perform assertions like `.should('be.checked')`, make sure the component is inside a QForm, otherwise Quasar will skip updating the native `checked` DOM property;
- since native inputs are deep down into the DOM of the input component, you should create your own helper to access them.
  Here're a couple of examples:

```ts
// Custom command returning the native input inside the Quasar component
function dataCyRadio(dataCyId: string) {
  return cy.dataCy(dataCyId).then(($quasarRadio) => {
    return cy.get('input:radio', {
      withinSubject: $quasarRadio,
    });
  });
}

function dataCyCheckbox(dataCyId: string) {
  return cy.dataCy(dataCyId).then(($quasarCheckbox) => {
    return cy.get('input:checkbox', {
      withinSubject: $quasarCheckbox,
    });
  });
}

// "force" option is needed as the native input is hidden
dataCyRadio('my-radio-button').check({ force: true });
dataCyRadio('my-radio-button').should('not.be.checked');
```

- you can select options into a QSelect like such

```ts
cy.dataCy('select').click();
cy.withinSelectMenu(() => {
  // Select by content
  cy.contains('Option 1').click();
  // Select by index
  cy.get('.q-item').eq(1).click();
});
```

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
cd test-project
yarn sync:cypress
yarn test:e2e:ci
yarn test:component:ci
```
