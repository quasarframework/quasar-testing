import { expect, test } from "../fixtures";

test.describe("QuasarDialog", () => {
  test("shows a message and closes on OK", async ({ mount, quasar }) => {
    const component = await mount("test/playwright/demo/QuasarDialog.default");

    await component.getByTestId("open-dialog-button").click();
    await quasar.withinDialog(async dialog => {
      await expect(dialog).toContainText("Hello, I am a dialog");
      await dialog.getByTestId("ok-button").click();
    });
    await expect(component.getByTestId("ok-count")).toHaveValue("1");
  });

  test("stays open when not dismissed", async ({ mount, quasar }) => {
    const component = await mount("test/playwright/demo/QuasarDialog.default");

    await component.getByTestId("open-dialog-button").click();
    // The persistent option skips the "dialog closed" wait.
    await quasar.withinDialog(
      async dialog => {
        await expect(dialog).toContainText("Hello, I am a dialog");
      },
      { persistent: true }
    );
    await expect(quasar.dialog()).toBeVisible();

    await quasar.closeDialog(quasar.dialog(), "escape");
    await expect(quasar.dialog()).toHaveCount(0);
  });
});

test.describe("stacked dialogs", () => {
  test("picks a dialog by test id and closes the top one with the backdrop", async ({
    mount,
    quasar
  }) => {
    const component = await mount("test/playwright/demo/QuasarDialog.stacked");

    await component.getByTestId("open-outer-button").click();
    await quasar
      .dialog({ testId: "outer-dialog" })
      .getByTestId("open-inner-button")
      .click();

    // dialog() defaults to the top-most one. last: false picks the bottom-most.
    await expect(quasar.dialog()).toContainText("Inner dialog");
    await expect(quasar.dialog({ last: false })).toContainText("Outer dialog");

    await quasar.closeDialog(quasar.dialog(), "backdrop");

    await expect(quasar.dialog()).toContainText("Outer dialog");
  });

  test("refuses Escape for a dialog that is not on top", async ({
    mount,
    quasar
  }) => {
    const component = await mount("test/playwright/demo/QuasarDialog.stacked");

    await component.getByTestId("open-outer-button").click();
    await quasar
      .dialog({ testId: "outer-dialog" })
      .getByTestId("open-inner-button")
      .click();
    await expect(quasar.dialog({ testId: "inner-dialog" })).toBeVisible();

    // Escape reaches the top-most dialog only, so the helper names the reason.
    await expect(
      quasar.closeDialog(quasar.dialog({ testId: "outer-dialog" }), "escape")
    ).rejects.toThrow("Escape only closes the top-most dialog");
  });
});
