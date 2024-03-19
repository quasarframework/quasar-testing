function isCheckBasedComponent(subject: JQuery<HTMLElement>) {
  return (
    subject.hasClass('q-checkbox') ||
    subject.hasClass('q-toggle') ||
    subject.hasClass('q-radio')
  );
}

export function registerCypressOverwrites() {
  Cypress.Commands.overwrite<'select', 'element'>(
    'select',
    (originalFn, subject, valueOrTextOrIndex, options) => {
      // Hijack the subject to be the root q-select element if we notice we are inside one of them
      // This is due to Quasar passing data-cy attr to the underlying "q-field__native" element
      // The re-target allow to use this command seamlessly, but the problem will still bite back in other scenarios
      // TODO: the best solution would be to exempt data-cy from being copied down by Quasar
      if (subject.hasClass('q-field__native')) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        subject = subject.closest('.q-select') || subject;
      }

      if (subject.hasClass('q-select')) {
        const isMultipleSelect = subject.hasClass('q-select--multiple');

        if (Array.isArray(valueOrTextOrIndex)) {
          if (!isMultipleSelect) {
            throw new Error(
              'Cypress: select command with array param can only be used with a multiple select',
            );
          }
        } else {
          valueOrTextOrIndex = [valueOrTextOrIndex];
        }

        if (valueOrTextOrIndex.length === 0) {
          throw new Error(
            'Cypress: select command requires at least one value',
          );
        }

        cy.wrap(subject).should('be.visible').click();
        cy.withinSelectMenu({
          persistent: isMultipleSelect,
          fn: () => {
            (valueOrTextOrIndex as (string | number)[]).forEach((value) => {
              if (typeof value === 'string') {
                cy.get('.q-item[role=option]')
                  .should('be.visible')
                  .contains(value)
                  .click();
              } else {
                cy.get('.q-item[role=option]')
                  .should('be.visible')
                  .eq(value)
                  .click();
              }
            });
          },
        });

        return;
      }

      return originalFn(subject, valueOrTextOrIndex, options);
    },
  );

  Cypress.Commands.overwrite<'check', 'element'>(
    'check',
    (originalFn, subject, options) => {
      if (isCheckBasedComponent(subject)) {
        if (!subject.is('[aria-checked="true"]')) {
          cy.wrap(subject).click();
        }
        return;
      }

      return originalFn(subject, options);
    },
  );

  Cypress.Commands.overwrite<'uncheck', 'element'>(
    'uncheck',
    (originalFn, subject, options) => {
      if (isCheckBasedComponent(subject)) {
        if (!subject.is('[aria-checked="false"]')) {
          cy.wrap(subject).click();
        }
        return;
      }

      return originalFn(subject, options);
    },
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  chai.Assertion.overwriteProperty('checked', (_super: () => void) => {
    return function (
      this: typeof chai.Assertion & { __flags: { negate?: boolean } },
    ) {
      const subject = this._obj as JQuery<HTMLElement> | undefined;

      if (subject && isCheckBasedComponent(subject)) {
        const expectedValue = this.__flags.negate ? 'false' : 'true';
        new chai.Assertion(subject[0]).to.have.attr(
          'aria-checked',
          expectedValue,
        );
      } else {
        _super.call(this);
      }
    };
  });
}
