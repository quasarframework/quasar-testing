declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Selects a given date into a QDate.
       * @example cy.get('.q-date').selectDate('11/02/2021')
       * @example cy.dataCy('start-date').selectDate(new Date())
       */
      selectDate<E extends HTMLElement = HTMLElement>(
        value: string | Date,
      ): Chainable<JQueryWithSelector<E>>;
    }
  }
}

export function registerSelectDate() {
  Cypress.Commands.add(
    'selectDate',
    { prevSubject: 'element' },
    (subject, value) => {
      if (!subject.hasClass('q-date')) {
        throw new Error('Subject is not a QDate');
      }

      const targetDate = typeof value === 'string' ? new Date(value) : value;

      cy.wrap(subject).within(() => {
        cy.get('.q-date__navigation div:not(.q-date__arrow)')
          .last()
          .as('yearSelector');
        cy.get('.q-date__navigation div:not(.q-date__arrow)')
          .first()
          .as('monthSelector');

        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();
        const targetDay = targetDate.getDate();

        // Since it's easy to detect it with the year selector,
        // we avoid selecting the year if it's already the target one
        cy.get('@yearSelector')
          .invoke('text')
          .then((currentYear) => {
            if (currentYear !== targetYear.toString()) {
              cy.get('@yearSelector').click();
              cy.contains(targetYear).click();
            }
          });

        cy.get('@monthSelector').click();
        cy.get('.q-date__months-item').eq(targetMonth).click();

        // The target day number is searched only into days buttons,
        // skipping filler and out of range days
        cy.get('.q-date__calendar-item--in').contains(targetDay).click();
      });

      return cy.wrap(subject);
    },
  );
}
