import { expect, test } from '../fixtures';

test.describe('VModelComponent', () => {
  test('shows the value', async ({ mount }) => {
    const component = await mount(
      'test/playwright/demo/VModelComponent/Default',
    );

    await expect(component.getByTestId('model-value')).toContainText('Quasar');
  });

  test('updates the model from the inner button', async ({ mount }) => {
    const component = await mount(
      'test/playwright/demo/VModelComponent/Default',
    );

    // The story writes its ref into a hidden input.
    await expect(component.getByTestId('recorded-model')).toHaveValue('Quasar');

    await component.getByTestId('button').click();

    await expect(component.getByTestId('model-value')).toContainText('uasar');
    await expect(component.getByTestId('recorded-model')).toHaveValue('uasar');
  });
});
