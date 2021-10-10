import { mount } from '@cypress/vue';
import QuasarTooltip from './../QuasarTooltip.vue';

describe('QuasarTooltip', () => {
  it('should show a tooltip', () => {
    mount(QuasarTooltip, {})
      .get('.q-btn')
      .trigger('mouseover')
      .get('.q-tooltip')
      .contains('Here I am!');
  });
});
