import DialogWrapper from 'app/test/playwright/wrappers/DialogWrapper.vue';
import AppDialog from '../AppDialog.vue';
import {
  test,
  expect,
  withinDialog,
} from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';

test.describe('AppDialog', () => {
  test('should show a dialog with a message', async ({ mount, page }) => {
    const message = 'Hello, I am a dialog';
    await mount(DialogWrapper, {
      props: {
        component: AppDialog,
        componentProps: { message },
      },
    });

    await withinDialog(page, async (dialog) => {
      await expect(dialog).toContainText(message);

      await dialog.getByTestId('ok-button').click();
      await dialog.waitFor({ state: 'hidden' });
    });
  });

  test('should keep the dialog open when not dismissed', async ({
    mount,
    page,
  }) => {
    const message = 'Hello, I am a dialog';
    await mount(DialogWrapper, {
      props: {
        component: AppDialog,
        componentProps: { message, persistent: true },
      },
    });

    await withinDialog(page, {
      fn: async (dialog) => {
        await expect(dialog).toContainText(message);
        await expect(dialog).toBeVisible();
      },
      persistent: true,
    });
  });
});
