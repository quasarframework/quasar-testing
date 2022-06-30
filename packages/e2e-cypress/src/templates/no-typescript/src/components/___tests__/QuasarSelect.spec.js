import { mount } from '@cypress/vue';
import QuasarSelect from '../QuasarSelect.vue';

describe('QuasarSelect', () => {
  it('selects an option by content', () => {
    mount(QuasarSelect);

    cy.dataCy('select').click();
    cy.withinSelectMenu(() => {
      cy.contains('Option 1').click();
    });

    cy.dataCy('select-value').should('have.text', 'Option 1');
  });

  it('selects an option by cardinality', () => {
    mount(QuasarSelect);

    cy.dataCy('select').click();
    cy.withinSelectMenu(() => {
      cy.get('.q-item').eq(1).click();
    });

    cy.dataCy('select-value').should('have.text', 'Option 2');
  });

  it('selects an option asynchronously', () => {
    mount(QuasarSelect, {
      props: {
        loadOptionsAsync: true,
      },
    });

    // Wait for loading to complete
    cy.dataCy('select').get('.q-spinner').should('not.exist');

    cy.dataCy('select').click();
    cy.withinSelectMenu(() => {
      cy.contains('Option 3').click();
    });

    cy.dataCy('select-value').should('have.text', 'Option 3');
  });
});
