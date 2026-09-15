import { expect, test } from "../fixtures";

// QCheckbox, QToggle and QRadio have aria-checked. Playwright drives them natively.
test.describe("QuasarCheckComponents", () => {
  test("checks and unchecks a QCheckbox", async ({ mount }) => {
    const component = await mount(
      "test/playwright/demo/QuasarCheckComponents/Default"
    );
    const checkbox = component.getByTestId("checkbox");

    await checkbox.check();
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test("checks and unchecks a QToggle", async ({ mount }) => {
    const component = await mount(
      "test/playwright/demo/QuasarCheckComponents/Default"
    );
    const toggle = component.getByTestId("toggle");

    await toggle.check();
    await expect(toggle).toBeChecked();

    await toggle.uncheck();
    await expect(toggle).not.toBeChecked();
  });

  test("checks a QRadio", async ({ mount }) => {
    const component = await mount(
      "test/playwright/demo/QuasarCheckComponents/Default"
    );

    await component.getByTestId("radio-1").check();
    await expect(component.getByTestId("radio-1")).toBeChecked();

    await component.getByTestId("radio-2").check();
    await expect(component.getByTestId("radio-2")).toBeChecked();
    await expect(component.getByTestId("radio-1")).not.toBeChecked();
  });
});
