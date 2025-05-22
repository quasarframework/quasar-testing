import {
  test,
  expect,
} from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';
import AppDark from '../AppDark.vue';

test('changes its color', async ({ mount }) => {
  const darkCard = await mount(AppDark);

  await expect(darkCard).not.toHaveClass(/q-dark/);

  const darkModeToggleButton = darkCard.getByTestId('dark-mode-toggle-button');
  await darkModeToggleButton.click();
  await expect(darkCard).toHaveClass(/q-dark/);

  await darkModeToggleButton.click();
  await expect(darkCard).not.toHaveClass(/q-dark/);
});
