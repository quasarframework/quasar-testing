import { expect, test } from "../fixtures";

test.describe("color assertions", () => {
  test("accept Quasar names, CSS variables, names and hex codes", async ({
    mount
  }) => {
    const component = await mount(
      "test/playwright/demo/color-assertions/Default"
    );
    const wrapper = component.locator(".wrapper");

    await expect(wrapper).toHaveColor("primary");
    await expect(wrapper).toHaveColor("var(--q-primary)");
    await expect(wrapper).toHaveBackgroundColor("black");
    await expect(wrapper).toHaveBackgroundColor("#000");
    await expect(wrapper).not.toHaveBackgroundColor("white");
  });
});
