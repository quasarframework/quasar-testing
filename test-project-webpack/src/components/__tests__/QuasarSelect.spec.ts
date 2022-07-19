import { mount } from '@cypress/vue';
import QuasarSelect from '../QuasarSelect.vue';

function dataCySelect(dataCyId: string) {
  return cy.dataCy(dataCyId).closest('.q-select');
}

describe('QuasarSelect', () => {
  it('makes sure the select is disabled', () => {
    mount(QuasarSelect, {
      props: { disable: true },
    });

    // `cy.dataCy('select')` won't work in this case, as it won't get the root q-select element
    dataCySelect('select').should('have.attr', 'aria-disabled', 'true');
  });

  it('selects an option by content', () => {
    mount(QuasarSelect);

    cy.dataCy('select').select('Option 1');
    cy.dataCy('select-value').should('have.text', 'Option 1');
  });

  it('selects an option by cardinality', () => {
    mount(QuasarSelect);

    cy.dataCy('select').select(1);
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

    cy.dataCy('select').select('Option 3');
    cy.dataCy('select-value').should('have.text', 'Option 3');
  });
});
