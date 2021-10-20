import { mount } from '@cypress/vue';
import LayoutContainer from 'app/test/cypress/wrappers/LayoutContainer.vue';
import QuasarPageSticky from '../QuasarPageSticky.vue';

describe('QuasarPageSticky', () => {
  it('should show a drawer', () => {
    mount(LayoutContainer, {
      props: {
        component: QuasarPageSticky,
        title: 'Test',
      },
    });
  });
});
