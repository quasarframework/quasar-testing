import { expect, test } from "../fixtures";

test.describe("QuasarDialogPlugin", () => {
  test("resolves with ok when the dialog is confirmed", async ({
    mount,
    quasar
  }) => {
    const component = await mount(
      "test/playwright/demo/QuasarDialogPlugin/Default"
    );

    await expect(component.getByTestId("plugin-outcome")).toHaveValue("");

    await component.getByTestId("open-plugin-dialog-button").click();
    await quasar.withinDialog(async dialog => {
      await expect(dialog.getByTestId("plugin-dialog-message")).toHaveText(
        "Hello, I am a plugin dialog"
      );
      await dialog.getByTestId("plugin-ok-button").click();
    });

    await expect(component.getByTestId("plugin-outcome")).toHaveValue("ok");
  });

  test("resolves with cancel when the dialog is dismissed", async ({
    mount,
    quasar
  }) => {
    const component = await mount(
      "test/playwright/demo/QuasarDialogPlugin/Default"
    );

    await component.getByTestId("open-plugin-dialog-button").click();
    await quasar.withinDialog(async dialog => {
      await dialog.getByTestId("plugin-cancel-button").click();
    });

    await expect(component.getByTestId("plugin-outcome")).toHaveValue("cancel");
  });
});
