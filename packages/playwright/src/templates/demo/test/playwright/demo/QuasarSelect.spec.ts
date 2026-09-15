import { devices } from '@playwright/test';
import { expect, test } from '../fixtures';

test.describe('QuasarSelect', () => {
  test('refuses to open a disabled QSelect', async ({ mount, quasar }) => {
    const component = await mount('test/playwright/demo/QuasarSelect/Disabled');

    // data-testid lands on the inner combobox input. select() climbs to the QSelect root.
    const select = quasar.select(component.getByTestId('select'));
    await expect(select.root).toHaveAttribute('aria-disabled', 'true');

    // Without the guard this times out inside open() instead of naming the reason.
    await expect(select.open()).rejects.toThrow('The QSelect is disabled');
  });

  test('picks an option that is only rendered after scrolling', async ({
    mount,
    quasar,
  }) => {
    const component = await mount('test/playwright/demo/QuasarSelect/LongList');

    // Quasar renders a slice of a long list. The helper scrolls until the option exists.
    await quasar.selectOption(component.getByTestId('select'), 'Option 180');

    await expect(component.getByTestId('select-value')).toHaveText(
      'Option 180',
    );
  });

  test('selects an option by label', async ({ mount, quasar }) => {
    const component = await mount('test/playwright/demo/QuasarSelect/Default');

    await quasar.selectOption(component.getByTestId('select'), 'Option 1');
    await expect(component.getByTestId('select-value')).toHaveText('Option 1');
  });

  test('selects an option by index', async ({ mount, quasar }) => {
    const component = await mount('test/playwright/demo/QuasarSelect/Default');

    await quasar.selectOption(component.getByTestId('select'), 1);
    await expect(component.getByTestId('select-value')).toHaveText('Option 2');
  });

  test('selects an option once the options are loaded', async ({
    mount,
    quasar,
  }) => {
    const component = await mount(
      'test/playwright/demo/QuasarSelect/AsyncOptions',
    );

    // open() waits for the listbox. It exists only once the options are there.
    await quasar.selectOption(component.getByTestId('select'), 'Option 3');
    await expect(component.getByTestId('select-value')).toHaveText('Option 3');
  });

  test('selects multiple options', async ({ mount, quasar }) => {
    const component = await mount('test/playwright/demo/QuasarSelect/Multiple');

    await quasar.selectOption(component.getByTestId('select'), [
      'Option 1',
      'Option 2',
    ]);
    await expect(component.getByTestId('select-value')).toContainText(
      'Option 1',
    );
    await expect(component.getByTestId('select-value')).toContainText(
      'Option 2',
    );
  });
});

test.describe('QuasarSelect in dialog mode', () => {
  // On mobile platforms QSelect renders its options in a dialog instead of a
  // menu. Quasar reads the platform from the user agent. Spreading the whole
  // device preset would also set defaultBrowserType, which test.use() rejects
  // inside a describe group, so take the emulation options alone.
  const pixel5 = devices['Pixel 5'];
  test.use({
    userAgent: pixel5.userAgent,
    viewport: pixel5.viewport,
    isMobile: pixel5.isMobile,
    hasTouch: pixel5.hasTouch,
  });

  test('selects an option by label', async ({ mount, page, quasar }) => {
    const component = await mount('test/playwright/demo/QuasarSelect/Default');
    const select = quasar.select(component.getByTestId('select'));

    await select.open();
    // The options render inside a dialog on mobile platforms.
    await expect(page.locator('.q-select__dialog')).toHaveCount(1);

    await select.pick('Option 2');
    await expect(component.getByTestId('select-value')).toHaveText('Option 2');
  });
});
