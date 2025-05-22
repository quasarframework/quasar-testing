import AppDate from '../AppDate.vue';
import {
  selectDate,
  test,
  expect,
} from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';

const targetDate = '2023/02/23';

test.describe('AppDate', () => {
  test('selects a date by date string', async ({ mount }) => {
    const component = await mount(AppDate);
    const subject = component.getByTestId('date-picker');

    await selectDate(subject, targetDate);
    await expect(component.getByTestId('selected-date-input')).toHaveValue(
      targetDate,
    );
    await component.unmount();
  });

  test('selects a date by date object', async ({ mount }) => {
    const component = await mount(AppDate);

    const subject = component.getByTestId('date-picker');
    await selectDate(subject, targetDate);
    await expect(component.getByTestId('selected-date-input')).toHaveValue(
      targetDate,
    );
    await component.unmount();
  });

  test('selects a date displayed in a popup proxy', async ({ mount, page }) => {
    const component = await mount(AppDate);

    await component.getByTestId('open-date-picker-popup-button').click();

    const datePickerDialog = page.getByTestId('date-proxy');
    await selectDate(datePickerDialog, targetDate);
    await expect(component.getByTestId('selected-date-input')).toHaveValue(
      targetDate,
    );
  });
});
