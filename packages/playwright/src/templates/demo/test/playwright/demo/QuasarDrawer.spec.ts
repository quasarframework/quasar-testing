import { expect, test } from '../fixtures';

test.describe('QuasarDrawer', () => {
  test('scrolls its content', async ({ mount }) => {
    const component = await mount('test/playwright/demo/QuasarDrawer.inLayout');
    const button = component.getByTestId('button');

    await expect(component.getByTestId('drawer')).toBeVisible();
    await expect(button).not.toBeInViewport();

    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeInViewport();
  });
});
