import { expect, test } from "../fixtures";

const targetDate = "2023/02/23";

test.describe("QuasarDate", () => {
  test("selects a date by string", async ({ mount, quasar }) => {
    const component = await mount("test/playwright/demo/QuasarDate/Default");

    await quasar.selectDate(component.getByTestId("date-picker"), targetDate);
    await expect(component.getByTestId("date-value")).toHaveText(targetDate);
  });

  test("selects a date by parts", async ({ mount, quasar }) => {
    const component = await mount("test/playwright/demo/QuasarDate/Default");

    // The parts form. month is 1 to 12, so 11 is November.
    await quasar.selectDate(component.getByTestId("date-picker"), {
      year: 2024,
      month: 11,
      day: 5
    });

    await expect(component.getByTestId("date-value")).toHaveText("2024/11/05");
  });

  test("selects a date inside a dialog", async ({ mount, quasar }) => {
    const component = await mount("test/playwright/demo/QuasarDate/Default");

    await component.getByTestId("open-date-picker-popup-button").click();
    // The component hides the dialog on update. withinDialog waits for that.
    await quasar.withinDialog(async dialog => {
      await quasar.selectDate(
        dialog.getByTestId("date-picker-popup"),
        targetDate
      );
    });
    await expect(component.getByTestId("date-value")).toHaveText(targetDate);
  });
});
