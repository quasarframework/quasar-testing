import { expect, test } from "../fixtures";

test.describe("QuasarTooltip", () => {
  test("shows a tooltip on hover", async ({ mount, page }) => {
    const component = await mount("test/playwright/demo/QuasarTooltip/Default");

    // The tooltip renders in a portal. Query the page for it.
    await expect(page.getByTestId("tooltip")).toHaveCount(0);

    await component.getByTestId("button").hover();
    await expect(page.getByTestId("tooltip")).toHaveText("Here I am!");
  });
});
