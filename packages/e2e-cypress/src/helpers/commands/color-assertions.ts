declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainer<Subject> {
      /**
       * `have.css` matcher compares the computedColor, which is a rgb() value.
       * This custom matcher instead accept any valid CSS color format.
       *
       * @example
       *    cy.get('foo').should('have.color', 'white')
       *    cy.get('foo').should('have.color', '#fff')
       *    cy.get('foo').should('have.color', 'var(--q-primary)')
       */
      (chainer: 'have.color', type: string): Chainable<Subject>;
      /**
       * `have.css` matcher compares the computedColor, which is a rgb() value.
       * This custom matcher instead accept any valid CSS color format.
       *
       * @example
       *    cy.get('foo').should('have.backgroundColor', 'black')
       *    cy.get('foo').should('have.backgroundColor', '#000')
       *    cy.get('foo').should('have.backgroundColor', 'var(--q-dark)')
       */
      (chainer: 'have.backgroundColor', type: string): Chainable<Subject>;
    }
  }
}

type CssStyleProperties = Extract<keyof CSSStyleDeclaration, string>;

// This is a helper function to convert assert colors correctly
// Cypress looks at the computed color which is always rgb()
// This makes it possible to compare `black` to `rgb(0, 0, 0)` for instance
const compareColor =
  (color: string, property: CssStyleProperties) =>
  (targetElement: JQuery<HTMLElement>) => {
    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    tempElement.style.display = 'none'; // make sure it doesn't actually render
    document.body.appendChild(tempElement); // append so that `getComputedStyle` actually works

    const tempColor = getComputedStyle(tempElement).color;
    const targetColor = getComputedStyle(targetElement[0])[property];

    document.body.removeChild(tempElement); // remove it because we're done with it

    expect(tempColor).to.equal(targetColor);
  };

const COLOR_RELATED_CSS_PROPERTIES: CssStyleProperties[] = [
  'color',
  'backgroundColor',
];

export function registerColorAssertions() {
  Cypress.Commands.overwrite(
    'should',
    (originalFn, subject, expectation, ...args) => {
      const customMatchers = Object.fromEntries(
        COLOR_RELATED_CSS_PROPERTIES.map((property) => [
          `have.${property}`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          compareColor(args[0], property),
        ]),
      );

      // See if the expectation is a string and if it is a member of our custom matchers
      if (
        typeof expectation === 'string' &&
        Object.keys(customMatchers).includes(expectation)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return originalFn(subject, customMatchers[expectation]);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return originalFn(subject, expectation, ...args);
    },
  );
}
