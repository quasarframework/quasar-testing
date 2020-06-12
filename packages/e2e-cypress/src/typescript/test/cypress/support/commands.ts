// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<Element>;
  }
}

// Find elements by "data-cy" attribute, making your tests
//  more robust with respect to codebase changes
// TODO: remove when https://github.com/cypress-io/cypress/issues/7510 is released
// eslint-disable-next-line @typescript-eslint/no-misused-promises
Cypress.Commands.add('dataCy', value => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('testRoute', route => {
  cy.location().should(loc => {
    expect(loc.hash).to.contain(route);
  });
});

// these two commands let you persist local storage between tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LOCAL_STORAGE_MEMORY: Record<string, any> = {};

Cypress.Commands.add('saveLocalStorage', () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add('restoreLocalStorage', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});
