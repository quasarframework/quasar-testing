/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
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
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import { mount } from 'cypress/vue';
import { Quasar } from 'quasar';
import quasarUserOptions from '../../src/quasar-user-options';

Cypress.Commands.add('mount', (component, options = {}) => {
  // Setup options object
  options.global = options.global || {};
  options.global.stubs = options.global.stubs || {};
  options.global.components = options.global.components || {};
  options.global.plugins = options.global.plugins || [];

  /* Add any global plugins */
  options.global.plugins.push({
    install(app) {
      app.use(Quasar, quasarUserOptions);
    },
  });

  /* Add any global components */
  // options.global.components['Button'] = Button;

  return mount(component, options);
});
