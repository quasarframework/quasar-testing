declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       * @example cy.dataCy('greeting', { timeout: 0 })
       */
      dataCy<E extends Node = HTMLElement>(
        value: string,
        options?: Partial<
          Cypress.Loggable &
            Cypress.Timeoutable &
            Cypress.Withinable &
            Cypress.Shadow
        >,
      ): Chainable<JQuery<E>>;
    }
  }
}

export function registerDataCy() {
  Cypress.Commands.add(
    'dataCy',
    { prevSubject: 'optional' },
    (subject, value, options) => {
      return cy.get(
        `[data-cy=${value}]`,
        Object.assign({ withinSubject: subject }, options),
      );
    },
  );
}
