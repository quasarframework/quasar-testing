import {
  test,
  expect,
} from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';
import AppTooltip from '../AppTooltip.vue';

test.describe('AppTooltip', () => {
  test('should show a tooltip', async ({ mount, page }) => {
    const button = await mount(AppTooltip);
    await button.hover();

    const tooltip = page.locator('.q-tooltip');
    await expect(tooltip).toContainText('Here I am!');
  });
});
