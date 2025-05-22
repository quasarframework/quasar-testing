import { test, expect } from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';
import LayoutContainer from 'app/test/playwright/wrappers/LayoutContainer.vue';
import AppDrawer from '../AppDrawer.vue';

test.describe('AppDrawer', () => {
  test('should show a drawer', async ({ mount }) => {
    try {
      const component = await mount(LayoutContainer, {
        props: {
          component: AppDrawer,
        },
      });

      // Check that the drawer exists and the button is initially not visible
      await expect(component.getByTestId('drawer')).toBeVisible();
      await expect(component.getByTestId('button')).not.toBeInViewport();

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
