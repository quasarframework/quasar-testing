import { expect, test } from "../fixtures";

// This file is an example of how to write Playwright e2e tests. You can delete it.

// This test passes against a clean Quasar project
test.describe("Landing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has the Quasar title", async ({ page }) => {
    await expect(page).toHaveTitle(/Quasar/);
  });

  test("navigates to the second page", async ({ page }) => {
    await page.getByRole("link", { name: "Go to Second Page" }).click();
    await expect(page).toHaveRoute("second");
  });
});
