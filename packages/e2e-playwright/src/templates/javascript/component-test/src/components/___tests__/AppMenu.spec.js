import AppMenu from '../AppMenu.vue';
import {
  withinMenu,
  test,
  expect,
} from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';

test.describe('AppMenu', () => {
  test('click an item by content', async ({ mount, page }) => {
    const component = await mount(AppMenu);
    await component.click();

    await withinMenu(page, async (menu) => {
      await expect(menu).toBeVisible();
      await menu.locator('.q-item:has-text("Item 1")').click();
    });
  });

  test('click an item by cardinality', async ({ mount, page }) => {
    const component = await mount(AppMenu);
    await component.click();

    await withinMenu(page, async (menu) => {
      await expect(menu).toBeVisible();
      await menu.locator('.q-item').nth(1).click();
    });
  });
});
