# [Cypress](https://www.cypress.io/)

```shell
$ quasar ext add @quasar/testing-e2e-cypress
```

> You must have a running dev server in order to run integration tests. Be sure to either set the `"baseUrl"` in the `/cypress.json` file or use the `test` command provided by the base `@quasar/testing` extension.

We provide you some custom commands out-of-the-box, expecially:

- `dataCy`: implements the [selection best practice](https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements) to avoid brittle tests, `cy.dataCy('my-data-id')` is equivalent to `cy.get('[data-cy=my-data-id]')`;
- `testRoute`: checks the current page by testing if the URL hash contains the provided string, used as `cy.testRoute('home')`;
- `saveLocalStorage`/`restoreLocalStorage`: save and restore local storage between tests, used as `cy.saveLocalStorage()` or `cy.restoreLocalStorage()`.
