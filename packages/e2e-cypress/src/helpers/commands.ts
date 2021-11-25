import { VueWrapper } from '@vue/test-utils';

declare global {
  namespace Cypress {
    interface Chainer<Subject> {
      /**
       * @example
       *    cy.get('foo').should('have.color', 'white')
       *    cy.get('foo').should('have.color', '#fff')
       *    cy.get('foo').should('have.color', 'var(--q-primary)')
       */
      (chainer: 'have.color', type: string): Chainable<Subject>;
      /**
       * @example
       *    cy.get('foo').should('have.backgroundColor', 'black')
       *    cy.get('foo').should('have.backgroundColor', '#000')
       *    cy.get('foo').should('have.backgroundColor', 'var(--q-dark)')
       */
      (chainer: 'have.backgroundColor', type: string): Chainable<Subject>;
    }
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

      /**
       * Custom command to get the vue wrapper from a cypress instance.
       * @example cy.dataCy('greeting')
       *            .vue()
       *            .then((wrapper) => {
       *                wrapper.
       *            })
       */
      vue(): Chainable<VueWrapper<any>>;

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
    (
      subject: JQuery<HTMLElement> | undefined,
      value: string,
      options?: Partial<
        Cypress.Loggable &
          Cypress.Timeoutable &
          Cypress.Withinable &
          Cypress.Shadow
      >,
    ) => {
      return cy.get(
        `[data-cy=${value}]`,
        Object.assign(
          {
            withinSubject: subject,
          },
          options,
        ),
      );
    },
  );

  Cypress.Commands.add('vue', () => {
    // @ts-expect-error // This is not typed by Cypress
    return cy.wrap(Cypress.vueWrapper);
  });

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

  // This is a helper function to convert assert colors correctly
  // Cypress looks at the computed color which is always rgb()
  // This makes it possible to compare `black` to `rgb(0, 0, 0)` for instance
  const compareColor =
    (color: string, property: string) =>
    (targetElement: JQuery<HTMLElement>) => {
      const tempElement = document.createElement('div');
      tempElement.style.color = color;
      tempElement.style.display = 'none'; // make sure it doesn't actually render
      document.body.appendChild(tempElement); // append so that `getComputedStyle` actually works

      const tempColor = getComputedStyle(tempElement).color;
      // @ts-expect-error
      const targetColor = getComputedStyle(targetElement[0])[property];

      document.body.removeChild(tempElement); // remove it because we're done with it

      expect(tempColor).to.equal(targetColor);
    };

  // By default the `have.css` matcher will compare the computedColor, which is always a rgb() value.
  // This creates a custom matcher that you can pass any color and it will compute a rgb() value from it.
  Cypress.Commands.overwrite(
    'should',
    (originalFn, subject, expectation, ...args) => {
      const customMatchers: Record<string, any> = {
        'have.backgroundColor': compareColor(args[0], 'backgroundColor'),
        'have.color': compareColor(args[0], 'color'),
      };

      // See if the expectation is a string and if it is a member of Jest's expect
      if (typeof expectation === 'string' && customMatchers[expectation]) {
        return originalFn(subject, customMatchers[expectation]);
      }
      return originalFn(subject, expectation, ...args);
    },
  );

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
