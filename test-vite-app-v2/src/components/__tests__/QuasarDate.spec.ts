import { test, expect } from '@playwright/experimental-ct-vue';
import QuasarDate from '../QuasarDate.vue';
import { selectDate } from '@quasar/quasar-app-extension-testing-e2e-playwright';

const targetDate = '2023/02/23';

test.describe('QuasarDate', () => {
  test('selects a date by date string', async ({ mount }) => {
    const component = await mount(QuasarDate);
    const subject = component.getByTestId('date-picker');

    await selectDate(subject, targetDate);
    // expect(component.getByTestId('selected-date-input')).toHaveValue(
    //   targetDate,
    // );
    // component.unmount();
  });

  test('selects a date by date object', async ({ mount }) => {
    const component = await mount(QuasarDate);

    const subject = component.getByTestId('date-picker');
    // await selectDate(subject, targetDate);
    // expect(component.getByTestId('selected-date-input')).toHaveValue(
    //   targetDate,
    // );
    // component.unmount();
  });

  test('selects a date displayed in a popup proxy', async ({ mount, page }) => {
    const component = await mount(QuasarDate);
    const subject = component.getByTestId('date-picker');

    await component.getByTestId('open-date-picker-popup-button').click();

    const datePickerDialog = page.getByTestId('date-proxy');
    await selectDate(datePickerDialog, targetDate);
    // expect(component.getByTestId('selected-date-input')).toHaveValue(
    //   targetDate,
    // );
  });
});
