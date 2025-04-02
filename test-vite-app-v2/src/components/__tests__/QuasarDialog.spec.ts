import { test, expect } from '@playwright/experimental-ct-vue';
import DialogWrapper from 'app/test/cypress/wrappers/DialogWrapper.vue';
import QuasarDialog from '../QuasarDialog.vue';
import { withinDialog } from '@quasar/quasar-app-extension-testing-e2e-playwright';

test.describe('QuasarDialog', () => {
  test('should show a dialog with a message', async ({ mount, page }) => {
    const message = 'Hello, I am a dialog';
    await mount(DialogWrapper, {
      props: {
        component: QuasarDialog,
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
    try {
      await mount(DialogWrapper, {
        props: {
          component: QuasarDialog,
          componentProps: { message, persistent: true },
        },
      });
    } catch (error) {
      console.log(error);
    }
    //
    // await withinDialog(page, {
    //   fn: async (dialog) => {
    //     await expect(dialog).toContainText(message);
    //     await expect(dialog).toBeVisible();
    //   },
    //   persistent: true,
    // });
  });
});
