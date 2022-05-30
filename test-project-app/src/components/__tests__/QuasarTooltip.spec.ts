import { mount } from '@cypress/vue';
import QuasarTooltip from '../QuasarTooltip.vue';

describe('QuasarTooltip', () => {
  it('should show a tooltip', () => {
    mount(QuasarTooltip);

    cy.dataCy('button').trigger('mouseover');
    cy.dataCy('tooltip').contains('Here I am!');
  });
});
