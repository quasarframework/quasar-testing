import AppSelect from '../AppSelect.vue';
import {
  selectQSelectOption,
  test,
  expect,
} from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';

test.describe('AppSelect', () => {
  test('makes sure the select is disabled', async ({ mount }) => {
    const component = await mount(AppSelect, {
      props: { disable: true },
    });

    // We need the root of the select component, so we use this instead. The data-testid gets passed to the
    // native element and not to the root div of the component
    const selectComponent = component.locator('.q-select');
    await expect(selectComponent).toHaveAttribute('aria-disabled', 'true');
  });

  test('selects an option by content', async ({ mount }) => {
    const component = await mount(AppSelect);
    await selectQSelectOption(component, 'Option 1');

    const selectValue = component.getByTestId('select-value');
    await expect(selectValue).toHaveText('Option 1');
  });

  test('selects an option by cardinality', async ({ mount }) => {
    const component = await mount(AppSelect);
    await selectQSelectOption(component, 1);

    const selectValue = component.getByTestId('select-value');
    await expect(selectValue).toHaveText('Option 2');
  });

  test('selects an option asynchronously', async ({ mount }) => {
    const component = await mount(AppSelect, {
      props: { loadOptionsAsync: true },
    });

    const spinner = component.locator('.q-spinner');
    await expect(spinner).toBeHidden();

    await selectQSelectOption(component, 'Option 3');

    const selectValue = component.getByTestId('select-value');
    await expect(selectValue).toHaveText('Option 3');
  });
});
