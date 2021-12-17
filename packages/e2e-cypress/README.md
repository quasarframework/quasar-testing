## [Cypress](https://www.cypress.io/)

> You’re looking at Quasar v2 testing docs. If you're searching for Quasar v1 docs, head [here](https://testing.quasar.dev/packages/e2e-cypress/)

```shell
$ quasar ext add @quasar/testing-e2e-cypress@beta
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

This AE manages Quasar and Cypress integration for you, both for JavaScript and TypeScript.

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

Since version `4.0.0-beta.7`, this AE supports [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/introduction) and scaffolds by default the code to run both `e2e` and `unit` tests with Cypress.
Consequentially, the name of this package will likely change from `@quasar/quasar-app-extension-testing-e2e-cypress` to `@quasar/quasar-app-extension-testing-cypress` in the future.

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

- Since Jest can now be used without global types and Cypress can now run its own unit tests, Cypress configuration for TS codebases can be simplified:

  - remove `test/cypress/tsconfig.json` and consequentially `parserOptions` option into `test/cypress/.eslintrc.js`
  - remove `"test/cypress"` value from `exclude` option of root `tsconfig.json`. If only `"/dist", ".quasar", "node_modules"` values remains in that array, remove `exclude` option altogether, as it's already provided by `@quasar/app/tsconfig-preset`

- Add this code into your root `.eslintrc.js`

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

- We went through many Cypress major versions during this AE beta phase, Cypress v6 was the latest version supported by Qv1 AE, please check out [Cypress 7](https://docs.cypress.io/guides/references/migration-guide#Migrating-to-Cypress-7-0) and [Cypress 8](https://docs.cypress.io/guides/references/migration-guide#Migrating-to-Cypress-8-0) migration guides and adapt your code accordingly

- If you're using TypeScript, update your vue-shims file to match https://github.com/quasarframework/quasar-starter-kit/blob/master/template/src/shims-vue.d.ts

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
