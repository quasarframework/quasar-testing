import { expect, test } from '../fixtures';

const targetDate = '2023/02/23';

test.describe('QuasarDate', () => {
  test('selects a date by string', async ({ mount, quasar }) => {
    const component = await mount('test/playwright/demo/QuasarDate/Default');

    await quasar.selectDate(component.getByTestId('date-picker'), targetDate);
    await expect(component.getByTestId('date-value')).toHaveText(targetDate);
  });

  test('selects a date by parts', async ({ mount, quasar }) => {
    const component = await mount('test/playwright/demo/QuasarDate/Default');

    // Another year and month, so the navigation runs the other way round.
    await quasar.selectDate(component.getByTestId('date-picker'), {
      year: 2024,
      month: 11,
      day: 5,
    });

    await expect(component.getByTestId('date-value')).toHaveText('2024/11/05');
  });

  test('selects a date inside a dialog', async ({ mount, quasar }) => {
    const component = await mount('test/playwright/demo/QuasarDate/Default');

    await component.getByTestId('open-date-picker-popup-button').click();
    // The component hides the dialog on update. withinDialog waits for that.
    await quasar.withinDialog(async (dialog) => {
      await quasar.selectDate(dialog.locator('.q-date'), targetDate);
    });
    await expect(component.getByTestId('date-value')).toHaveText(targetDate);
  });
});
