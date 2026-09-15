import { expect, test } from "../fixtures";

test.describe("QuasarButton", () => {
  test("renders its label", async ({ mount }) => {
    const component = await mount("test/playwright/demo/QuasarButton/Default");

    await expect(component.getByTestId("button")).toContainText("test emit");
  });

  test("has the positive color", async ({ mount }) => {
    const component = await mount("test/playwright/demo/QuasarButton/Default");

    await expect(component.getByTestId("button")).toHaveBackgroundColor(
      "positive"
    );
    await expect(component.getByTestId("button")).toHaveColor("white");
  });

  test('emits "test" on click', async ({ mount }) => {
    const component = await mount("test/playwright/demo/QuasarButton/Default");

    // The story writes the emit count into a hidden input.
    await expect(component.getByTestId("test-emit-count")).toHaveValue("0");

    await component.getByTestId("button").click();

    await expect(component.getByTestId("test-emit-count")).toHaveValue("1");
  });

  test("takes its label from the props and updates in place", async ({
    mount
  }) => {
    const component = await mount(
      "test/playwright/demo/QuasarButton/WithLabel",
      { label: "first" }
    );

    await expect(component.getByTestId("button")).toContainText("first");

    // update() re-renders the same story with new props, without remounting.
    await component.update({ label: "second" });

    await expect(component.getByTestId("button")).toContainText("second");
  });
});
