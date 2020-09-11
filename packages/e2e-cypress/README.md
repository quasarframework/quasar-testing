# [Cypress](https://www.cypress.io/)

```shell
$ quasar ext add @quasar/testing-e2e-cypress
```

This AE is meant to manage Quasar and Cypress integration for you, both for JS and TS.

We have included some custom commands out-of-the-box:

- `dataCy`: implements the [selection best practice](https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements) to avoid brittle tests, `cy.dataCy('my-data-id')` is equivalent to `cy.get('[data-cy=my-data-id]')`;
- `testRoute`: checks the current page by testing if the URL hash contains the provided string, used as `cy.testRoute('home')`;
- `saveLocalStorage`/`restoreLocalStorage`: save and restore local storage between tests, used as `cy.saveLocalStorage()` or `cy.restoreLocalStorage()`.

You must have a running dev server in order to run integration tests. The scripts added by this AE automatically take care of this: `yarn test:e2e` and `yarn test:e2e:ci` will launch `quasar dev` when starting up the tests and kill it when cypress process ends.

This AE is a wrapper around Cypress, you won't be able to use this or understand most of the documentation if you haven't read [the official documentation](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html).
