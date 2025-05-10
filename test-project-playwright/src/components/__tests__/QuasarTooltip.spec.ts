import { test, expect } from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';
import QuasarTooltip from '../QuasarTooltip.vue';

test.describe('QuasarTooltip', () => {
  test('should show a tooltip', async ({ mount, page }) => {
    const button = await mount(QuasarTooltip);
    await button.hover();

    const tooltip = page.locator('.q-tooltip');
    await expect(tooltip).toContainText('Here I am!');
  });
});
