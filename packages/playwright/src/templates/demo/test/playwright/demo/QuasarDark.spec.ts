import { expect, test } from '../fixtures';

test.describe('QuasarDark', () => {
  test('follows dark mode', async ({ mount }) => {
    const component = await mount('test/playwright/demo/QuasarDark/Default');
    const card = component.getByTestId('dark-card');

    await expect(card).not.toHaveClass(/q-dark/);

    await component.getByTestId('toggle-dark-button').click();
    await expect(card).toHaveClass(/q-dark/);

    await component.getByTestId('toggle-dark-button').click();
    await expect(card).not.toHaveClass(/q-dark/);
  });
});
