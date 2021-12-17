declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
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

// these two commands let you persist local storage between tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LOCAL_STORAGE_MEMORY: Record<string, any> = {};

export function registerStorageHelpers() {
  Cypress.Commands.add('saveLocalStorage', () => {
    Object.keys(localStorage).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      LOCAL_STORAGE_MEMORY[key] = localStorage[key];
    });
  });

  Cypress.Commands.add('restoreLocalStorage', () => {
    Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
    });
  });
}
