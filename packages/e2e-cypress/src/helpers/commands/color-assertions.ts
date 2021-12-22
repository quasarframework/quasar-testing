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

const COLOR_RELATED_CSS_PROPERTIES: CssStyleProperties[] = [
  'color',
  'backgroundColor',
];

export function registerColorAssertions() {
  // Cypress looks at the computed color which is always rgb()
  // This makes it possible to compare `black` to `rgb(0, 0, 0)` for instance
  // Overriding `should` isn't the way to go to add new assertions,
  // we should add them via Chai methods
  for (const property of COLOR_RELATED_CSS_PROPERTIES) {
    chai.Assertion.addMethod(property, function (colorValue: string) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const targetElement: JQuery<HTMLElement> = this._obj;

      const tempElement = document.createElement('div');
      tempElement.style.color = colorValue;
      tempElement.style.display = 'none'; // make sure it doesn't actually render
      document.body.appendChild(tempElement); // append so that `getComputedStyle` actually works

      const tempColor = getComputedStyle(tempElement).color;
      const targetColor = getComputedStyle(targetElement[0])[property];

      document.body.removeChild(tempElement); // remove it because we're done with it

      expect(tempColor).to.equal(targetColor);

      const actual = tempColor;
      const expected = targetColor;
      this.assert(
        actual === expected,
        `expected #{this} to have ${property} #{exp}, but got #{act} instead`,
        `expected #{this} not to have ${property} #{exp}`,
        expected,
        actual,
      );
    });
  }
}
