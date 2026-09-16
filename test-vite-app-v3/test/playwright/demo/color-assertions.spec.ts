import { expect, test } from "../fixtures";

test.describe("color assertions", () => {
  test("accept Quasar names, CSS variables, names and hex codes", async ({
    mount
  }) => {
    const component = await mount(
      "test/playwright/demo/color-assertions/Default"
    );
    const coloredText = component.getByTestId("colored-text");

    await expect(coloredText).toHaveColor("primary");
    await expect(coloredText).toHaveColor("var(--q-primary)");
    await expect(coloredText).toHaveBackgroundColor("black");
    await expect(coloredText).toHaveBackgroundColor("#000");
    await expect(coloredText).not.toHaveBackgroundColor("white");
  });
});
