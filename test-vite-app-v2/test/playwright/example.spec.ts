import {
  test,
  expect,
} from '@quasar/quasar-app-extension-testing-e2e-playwright';

test('has title', async ({ page, withinDialog }) => {
  await page.goto('/');

  await page.getByTestId('open-dialog-button').click();

  await withinDialog(async (dialog) => {
    await expect(dialog).toContainText('Hello world!');

    await dialog.getByTestId('ok-button').click();
    await dialog.waitFor({ state: 'hidden' });
  });

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Quasar App/);
});
