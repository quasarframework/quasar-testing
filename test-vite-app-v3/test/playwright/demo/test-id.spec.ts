import { expect, test } from "../fixtures";

test.describe("getByTestId", () => {
  test("finds elements from the root", async ({ mount }) => {
    const component = await mount("test/playwright/demo/test-id/Default");

    await expect(component.getByTestId("wrapper")).toBeVisible();
    await expect(component.getByTestId("paragraph")).toContainText("Test");
  });

  test("finds elements inside another one", async ({ mount }) => {
    const component = await mount("test/playwright/demo/test-id/Default");

    await expect(
      component.getByTestId("wrapper").getByTestId("paragraph")
    ).toBeVisible();
  });

  test("supports special characters in the value", async ({ mount }) => {
    const component = await mount("test/playwright/demo/test-id/Default");

    await expect(component.getByTestId("dotted.name")).toContainText(
      "Special characters"
    );
  });
});
