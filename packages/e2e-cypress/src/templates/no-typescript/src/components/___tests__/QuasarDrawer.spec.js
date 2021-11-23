import { mount } from '@cypress/vue';
import LayoutContainer from 'app/test/cypress/wrappers/LayoutContainer.vue';
import QuasarDrawer from '../QuasarDrawer.vue';

describe('QuasarDrawer', () => {
  it('should show a drawer', () => {
    mount(LayoutContainer, {
      props: {
        component: QuasarDrawer,
      },
    });
  });
});
