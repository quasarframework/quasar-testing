import { test, expect } from '@playwright/experimental-ct-vue';
import QuasarDark from '../QuasarDark.vue';

test('changes its color', async ({ mount }) => {
  const darkCard = await mount(QuasarDark);

  await expect(darkCard).not.toHaveClass(/q-dark/);

  const darkModeToggleButton = darkCard.getByTestId('dark-mode-toggle-button');
  darkModeToggleButton.click();
  await expect(darkCard).toHaveClass(/q-dark/);

  darkModeToggleButton.click();
  await expect(darkCard).not.toHaveClass(/q-dark/);
});
