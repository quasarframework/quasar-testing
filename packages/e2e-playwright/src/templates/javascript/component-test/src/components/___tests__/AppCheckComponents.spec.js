import AppCheckComponents from '../AppCheckComponents.vue';
import {
  test,
  expect,
} from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';

test.describe('AppCheckbox', () => {
  test('can be used with normal Playwright commands', async ({ mount }) => {
    const component = await mount(AppCheckComponents);

    const checkbox = component.getByTestId('checkbox');
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });
});

test.describe('QuasarToggle', () => {
  test('can be used with normal Playwright commands', async ({ mount }) => {
    const component = await mount(AppCheckComponents);

    const toggle = component.getByTestId('toggle');
    await toggle.check();
    await expect(toggle).toBeChecked();

    await toggle.uncheck();
    await expect(toggle).not.toBeChecked();
  });
});

test.describe('QuasarRadio', () => {
  test('can be used with normal Playwright commands', async ({ mount }) => {
    const component = await mount(AppCheckComponents);

    const radio1 = component.getByTestId('radio-1');
    const radio2 = component.getByTestId('radio-2');

    await radio1.check();
    await expect(radio1).toBeChecked();

    await radio2.check();
    await expect(radio2).toBeChecked();
    await expect(radio1).not.toBeChecked();
  });
});
