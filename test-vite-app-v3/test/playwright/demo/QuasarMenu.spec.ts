import { expect, test } from "../fixtures";

test.describe("QuasarMenu", () => {
  test("clicks an item by content", async ({ mount, quasar }) => {
    const component = await mount("test/playwright/demo/QuasarMenu/Default");

    const menu = await quasar.openMenu(component.getByTestId("open-menu-btn"));
    await menu.getByText("Item 1").click();
    // v-close-popup closes the menu. Quasar removes it after the transition.
    await expect(menu).toHaveCount(0);
  });

  test("clicks an item by index", async ({ mount, quasar }) => {
    const component = await mount("test/playwright/demo/QuasarMenu/Default");

    await quasar.openMenu(component.getByTestId("open-menu-btn"));
    await quasar.menu().locator(".q-item").nth(1).click();
    await expect(quasar.menu()).toHaveCount(0);
  });

  test("ignores the popup of a QSelect", async ({ mount, quasar }) => {
    const component = await mount("test/playwright/demo/QuasarMenu/WithSelect");

    await quasar.select(component.getByTestId("select")).open();
    const menu = await quasar.openMenu(component.getByTestId("open-menu-btn"));

    // Two .q-menu elements are open. menu() returns the one that is not the listbox.
    await expect(quasar.menu()).toHaveCount(1);
    await expect(quasar.menu()).toContainText("Item 1");
    await expect(menu).toContainText("Item 1");
  });
});
