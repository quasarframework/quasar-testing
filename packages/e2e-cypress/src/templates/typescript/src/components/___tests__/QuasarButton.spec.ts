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

    cy.get('.q-btn').should('contain', label);
  });

  it('renders another message', () => {
    const label = 'Will this work?';
    mount(QuasarButton, {
      props: {
        label,
      },
    });

    cy.get('.q-btn').should('contain', label);
  });
});
