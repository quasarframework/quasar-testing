import { expect, test } from "../fixtures";

test.describe("public assets", () => {
  test("loads an image from the public folder", async ({ mount }) => {
    const component = await mount(
      "test/playwright/demo/LoadPublicAsset/Default"
    );
    const image = component.getByTestId("test-image");
    const naturalWidth = () =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth);

    await expect(image).toBeVisible();
    await expect.poll(naturalWidth).toBeGreaterThan(0);
  });
});
