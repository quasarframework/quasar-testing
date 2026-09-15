import { expect, test } from "../fixtures";

const stickyOffset = 18;

test.describe("QuasarPageSticky", () => {
  test("sticks to the bottom-right corner", async ({ mount, page }) => {
    const component = await mount(
      "test/playwright/demo/QuasarPageSticky.inLayout"
    );
    const button = component.getByTestId("button");

    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    const viewport = page.viewportSize();
    if (box === null || viewport === null) {
      throw new Error("The button or the viewport has no size");
    }

    expect(box.y + box.height).toBeCloseTo(viewport.height - stickyOffset, 0);
    expect(box.x + box.width).toBeCloseTo(viewport.width - stickyOffset, 0);
  });
});
