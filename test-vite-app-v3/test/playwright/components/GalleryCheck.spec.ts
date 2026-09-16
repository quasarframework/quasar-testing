import { expect, test } from "../fixtures";

test.describe("GalleryCheck", () => {
  test("reads the gallery boot parameters and the Playwright env switch", async ({
    mount
  }) => {
    const component = await mount(
      "components/gallery-check/GalleryCheck/Default"
    );

    // In hash mode urlPath is the router hash path, which the gallery does
    // not set, so it resolves to the root. publicPath is "/", the
    // quasar.config default.
    await expect(component.getByTestId("boot-url-path")).toHaveText("/");
    await expect(component.getByTestId("boot-public-path")).toHaveText("/");
    await expect(component.getByTestId("boot-param-keys")).toHaveText(
      "app,publicPath,redirect,router,ssrContext,urlPath"
    );
    await expect(component.getByTestId("boot-gallery-flag")).toHaveText("true");

    // Playwright starts the dev server with the switch on, so the define is true here.
    await expect(component.getByTestId("env-testing-flag")).toHaveText("true");
  });
});
