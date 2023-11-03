import { mount } from 'cypress/vue';
export {};
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}
