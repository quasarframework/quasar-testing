declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to test being on a given route.
       * @example cy.testRoute('home')
       */
      testRoute(value: string): void;
    }
  }
}

export function registerTestRoute() {
  Cypress.Commands.add('testRoute', (route) => {
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
}
