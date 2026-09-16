import { expect, test } from "../fixtures";

// This file is an example of how to write Playwright e2e tests. You can delete it.

// goto() resolves before the Vue app mounts. The link is absent until then.
const SECOND_PAGE_LINK_TIMEOUT_MS = 5_000;

// The title test passes against a new Quasar project. The second one needs a
// link the project may not have.
test.describe("Landing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has the Quasar title", async ({ page }) => {
    await expect(page).toHaveTitle(/Quasar/);
  });

  test("navigates to the second page", async ({ page }) => {
    const secondPageLink = page.getByRole("link", {
      name: "Go to Second Page"
    });
    const isLinkPresent = await secondPageLink
      .waitFor({ state: "attached", timeout: SECOND_PAGE_LINK_TIMEOUT_MS })
      .then(() => true)
      .catch(() => false);

    // A new Quasar project has no second page. Point this at a route your app
    // has, or delete the test.
    test.skip(!isLinkPresent, 'This project has no "Go to Second Page" link.');

    await secondPageLink.click();
    await expect(page).toHaveRoute("second");
  });
});
