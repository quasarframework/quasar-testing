import { test, expect } from '@playwright/experimental-ct-vue';
import QuasarSelect from '../QuasarSelect.vue';
import { selectQSelectOption } from '@quasar/quasar-app-extension-testing-e2e-playwright';

test.describe('QuasarSelect', () => {
  test('makes sure the select is disabled', async ({ mount }) => {
    const component = await mount(QuasarSelect, {
      props: { disable: true },
    });

    // We need the root of the select component, so we use this instead. The data-testid gets passed to the
    // native element and not to the root div of the component
    const selectComponent = component.locator('.q-select');
    await expect(selectComponent).toHaveAttribute('aria-disabled', 'true');
  });

  test('selects an option by content', async ({ mount }) => {
    const component = await mount(QuasarSelect);
    selectQSelectOption(component, 'Option 1');

    const selectValue = component.getByTestId('select-value');
    await expect(selectValue).toHaveText('Option 1');
  });

  test('selects an option by cardinality', async ({ mount }) => {
    const component = await mount(QuasarSelect);
    await selectQSelectOption(component, 1);

    const selectValue = component.getByTestId('select-value');
    await expect(selectValue).toHaveText('Option 2');
  });

  test('selects an option asynchronously', async ({ mount }) => {
    const component = await mount(QuasarSelect, {
      props: { loadOptionsAsync: true },
    });

    const spinner = component.locator('.q-spinner');
    await expect(spinner).not.toBeVisible();

    selectQSelectOption(component, 'Option 3');

    const selectValue = component.getByTestId('select-value');
    await expect(selectValue).toHaveText('Option 3');
  });
});
