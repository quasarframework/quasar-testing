## [Cypress](https://www.cypress.io/)

```shell
$ quasar ext add @quasar/testing-e2e-cypress
```

This AE is meant to manage Quasar and Cypress integration for you, both for JS and TS.

We have included some custom commands out-of-the-box:

| Name                  | Usage                      | Description                                                                                                                                                                                              |
| --------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataCy`              | `cy.dataCy('my-data-id')`  | Implements the [selection best practice](https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements) which avoids brittle tests, is equivalent to `cy.get('[data-cy=my-data-id]')` |
| `testRoute`           | `cy.testRoute('home')`     | Checks the current page by testing if the URL hash contains the provided string                                                                                                                          |
| `saveLocalStorage`    | `cy.saveLocalStorage()`    | Save local storage data to be used in subsequent tests                                                                                                                                                   |
| `restoreLocalStorage` | `cy.restoreLocalStorage()` | Restore previously saved local storage data                                                                                                                                                              |

You must have a running dev server in order to run integration tests. The scripts added by this AE automatically take care of this: `yarn test:e2e` and `yarn test:e2e:ci` will launch `quasar dev` when starting up the tests and kill it when cypress process ends.

This AE is a wrapper around Cypress, you won't be able to use this or understand most of the documentation if you haven't read [the official documentation](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html).
