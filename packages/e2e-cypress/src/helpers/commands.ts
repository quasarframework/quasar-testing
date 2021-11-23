declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy<E extends Node = HTMLElement>(value: string): Chainable<JQuery<E>>;

      /**
       * Custom command to test being on a given route.
       * @example cy.testRoute('home')
       */
      testRoute(value: string): void;

      /**
       * Persist current local storage data.
       * @example cy.saveLocalStorage()
       */
      saveLocalStorage(): void;

      /**
       * Restore saved data to local storage.
       * @example cy.restoreLocalStorage()
       */
      restoreLocalStorage(): void;
    }
  }
}

export const registerCommands = () => {
  Cypress.Commands.add(
    'dataCy',
    { prevSubject: 'optional' },
    (subject: JQuery<HTMLElement> | undefined, value: string) => {
      return cy.get(`[data-cy=${value}]`, {
        withinSubject: subject,
      });
    },
  );

  Cypress.Commands.add('testRoute', (route: string) => {
    cy.location().should((loc) => {
      const usesHashModeRouter = loc.hash.length > 0;

      const target = usesHashModeRouter ? loc.hash : loc.pathname;
      const pattern = usesHashModeRouter ? `#/${route}` : `/${route}`;

      expect(
        Cypress.minimatch(target, pattern, {
          nocomment: true,
        }),
      ).to.be.true;
    });
  });

  // these two commands let you persist local storage between tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LOCAL_STORAGE_MEMORY: Record<string, any> = {};

  Cypress.Commands.add('saveLocalStorage', () => {
    Object.keys(localStorage).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      LOCAL_STORAGE_MEMORY[key] = localStorage[key];
    });
  });

  Cypress.Commands.add('restoreLocalStorage', () => {
    Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
      localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
    });
  });

  // Not a command, but a common known problem with Cypress
  // We add it here since it's needed for both e2e and unit tests
  // Usually it should be placed into `cypress/support/index.ts` file
  // See https://github.com/quasarframework/quasar/issues/2233#issuecomment-492975745
  const resizeObserverLoopError = 'ResizeObserver loop limit exceeded';
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes(resizeObserverLoopError)) {
      // returning false here prevents Cypress from failing the test
      return false;
    }
  });
};
