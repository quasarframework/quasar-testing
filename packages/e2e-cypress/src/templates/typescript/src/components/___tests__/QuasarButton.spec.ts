import { mount } from '@cypress/vue';
import QuasarButton from '../QuasarButton.vue';

describe('QuasarButton', () => {
  it('renders a message', () => {
    const label = 'Hello there';
    mount(QuasarButton, {
      props: {
        label,
      },
    });

    cy.dataCy('button').should('contain', label);
  });

  it('renders another message', () => {
    const label = 'Will this work?';
    mount(QuasarButton, {
      props: {
        label,
      },
    });

    cy.dataCy('button').should('contain', label);
  });

  it('should have a `positive` color', () => {
    mount(QuasarButton);

    cy.dataCy('button')
      .should('have.backgroundColor', 'var(--q-positive)')
      .should('have.color', 'white');
  });

  it('should emit `test` upon click', () => {
    mount(QuasarButton);

    cy.dataCy('button')
      .click()
      .should(() => {
        expect(Cypress.vueWrapper.emitted('test')).to.have.length(1);
      });
  });
});
