## [Cypress](https://www.cypress.io/)

```shell
$ quasar ext add @quasar/testing-e2e-cypress@beta
```

This AE manages Quasar and Cypress integration for you, both for JavaScript and TypeScript.

Some custom commands are included out-of-the-box:

| Name                  | Usage                                                       | Description                                                                                                                                                                                              |
| --------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataCy`              | `cy.dataCy('my-data-id')`                                   | Implements the [selection best practice](https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements) which avoids brittle tests, is equivalent to `cy.get('[data-cy=my-data-id]')` |
| `testRoute`           | `cy.testRoute('home')` \| `cy.testRoute('books/*/pages/*')` | Tests if the current URL matches the provided string using [`minimatch`](https://docs.cypress.io/api/utilities/minimatch). Leading `#`, if using router hash mode, and `/` are automatically prepended.  |
| `saveLocalStorage`    | `cy.saveLocalStorage()`                                     | Save local storage data to be used in subsequent tests                                                                                                                                                   |
| `restoreLocalStorage` | `cy.restoreLocalStorage()`                                  | Restore previously saved local storage data                                                                                                                                                              |

You must have a running dev server in order to run integration tests. The scripts added by this AE automatically take care of this: `yarn test:e2e` and `yarn test:e2e:ci` will launch `quasar dev` when starting up the tests and kill it when cypress process ends.

This AE is a wrapper around Cypress, you won't be able to use this or understand most of the documentation if you haven't read [the official documentation](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html).

Since version `4.0.0-beta.5`, this AE supports [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/introduction) and scaffolds by default the code to run both `e2e` and `unit` tests with Cypress.
The name of this package will likely change from `@quasar/quasar-app-extension-testing-e2e-cypress` to `@quasar/quasar-app-extension-testing-cypress` in the future.

### Upgrade from Cypress AE v3 / Quasar v1

- Remove `"sourceMap": false` and related comment from `test/cypress/tsconfig.json` if it's present, as this has been fixed in a previous version of Cypress
- Remove `"target": "es6"` and related comment from `test/cypress/tsconfig.json`, as Vue3 (and so Quasar v2) won't support IE11
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

- Check out [Cypress 7.0 migration guide](https://docs.cypress.io/guides/references/migration-guide#Migrating-to-Cypress-7-0)

### Caveats

#### Assertions on Quasar input components

Some Cypress assertions, as `.should('be.checked')` for checkboxes and radio buttons, rely on the presence of a native DOM element, which many Quasar input components don't add by default for a better performance.
When testing those components with Cypress, you must set `name` attribute to force Quasar to add the underlying native inputs.
Also note that those Cypress assertions will only work when the input is inside a QForm, as otherwise Quasar skips updating the native `checked` DOM property.

Since native inputs are deep down into the DOM of the input component, you should create your own helper to access them.
Here's an example of how you could do it for radio buttons:

```ts
// Custom command returning the native input inside the Quasar component
function dataCyRadio(dataCyId: string) {
  return cy.dataCy(dataCyId).then(($quasarRadio) => {
    return cy.get('input:radio', {
      withinSubject: $quasarRadio,
    });
  });
}

// "force" option is needed as the native input is hidden
dataCyRadio('my-radio-button').check({ force: true });
dataCyRadio('my-radio-button').should('not.be.checked');
```
