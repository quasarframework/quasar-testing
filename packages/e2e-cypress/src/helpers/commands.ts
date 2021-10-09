// Had to setup a separate file for the types, otherwise there were typescript/eslint errors in the editor.
import './command-types';

export const registerCommands = () => {
  const dataCy = (subject: JQuery<HTMLElement> | undefined, value: string) => {
    return cy.get(`[data-cy=${value}]`, {
      withinSubject: subject,
    });
  };

  const testRoute = (route: string) => {
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
  };

  // these two commands let you persist local storage between tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LOCAL_STORAGE_MEMORY: Record<string, any> = {};

  const saveLocalStorage = () => {
    Object.keys(localStorage).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      LOCAL_STORAGE_MEMORY[key] = localStorage[key];
    });
  };

  const restoreLocalStorage = () => {
    Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
      localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
    });
  };

  Cypress.Commands.add('dataCy', { prevSubject: 'optional' }, dataCy);
  Cypress.Commands.add('testRoute', testRoute);
  Cypress.Commands.add('saveLocalStorage', saveLocalStorage);
  Cypress.Commands.add('restoreLocalStorage', restoreLocalStorage);
};
