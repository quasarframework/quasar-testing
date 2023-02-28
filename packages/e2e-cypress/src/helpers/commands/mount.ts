import { mount } from 'cypress/vue';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Helper mount function for Vue Components
       * @param component Vue Component or JSX Element to mount
       * @param options Options passed to Vue Test Utils
       */
      mount: typeof mount;
    }
  }
}

export function registerMount() {
  Cypress.Commands.add('mount', mount);
}
