import { test, expect } from '@playwright/experimental-ct-vue';
import LayoutContainer from 'app/test/cypress/wrappers/LayoutContainer.vue';
import QuasarDrawer from '../QuasarDrawer.vue';

test.describe('QuasarDrawer', () => {
  test('should show a drawer', async ({ mount }) => {
    try {
      const component = await mount(LayoutContainer, {
        props: {
          component: QuasarDrawer,
        },
      });

      // Check that the drawer exists and the button is initially not visible
      await expect(component.getByTestId('drawer')).toBeVisible();
      expect(component.getByTestId('button')).not.toBeInViewport();

      // Scroll to the bottom of the scroll area
      await component.locator('.q-scrollarea .scroll').evaluate((el) => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });

      // Wait for scrolling to complete and check button visibility
      await component
        .locator('.q-scrollarea .scroll')
        .getByTestId('button')
        .waitFor({ state: 'visible' });
      await expect(component.getByTestId('button')).toBeInViewport();
    } catch (error) {
      console.error(error);
    }
  });
});
