import { test, expect } from '@playwright/experimental-ct-vue';
import QuasarMenu from '../QuasarMenu.vue';
import { withinMenu } from '@quasar/quasar-app-extension-testing-e2e-playwright';

test.describe('QuasarMenu', () => {
  test('click an item by content', async ({ mount, page }) => {
    const component = await mount(QuasarMenu);
    await component.click();

    await withinMenu(page, async (menu) => {
      await expect(menu).toBeVisible();
      await menu.locator('.q-item:has-text("Item 1")').click();
    });
  });

  test('click an item by cardinality', async ({ mount, page }) => {
    const component = await mount(QuasarMenu);
    await component.click();

    await withinMenu(page, async (menu) => {
      await expect(menu).toBeVisible();
      await menu.locator('.q-item').nth(1).click();
    });
  });
});
