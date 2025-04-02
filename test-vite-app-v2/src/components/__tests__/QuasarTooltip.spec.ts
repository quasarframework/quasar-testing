import { test, expect } from '@playwright/experimental-ct-vue';
import QuasarTooltip from '../QuasarTooltip.vue';

test.describe('QuasarTooltip', () => {
  test('should show a tooltip', async ({ mount, page }) => {
    const button = await mount(QuasarTooltip);
    await button.hover();

    const tooltip = page.locator('.q-tooltip');
    await expect(tooltip).toContainText('Here I am!');
  });
});
