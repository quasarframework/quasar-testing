import { expect, Locator } from '@playwright/test';

/**
 * Determines if a component is a Quasar checkbox, toggle, or radio button
 * @param element - Playwright locator for the element
 * @returns Boolean indicating if the element is a check-based component
 */
async function isCheckBasedComponent(element: Locator): Promise<boolean> {
  const className = await element.getAttribute('class');
  return ['q-checkbox', 'q-toggle', 'q-radio'].some((item) =>
    className?.includes(item),
  );
}

/**
 * Selects one or more options from a Quasar QSelect component
 * @param element - Playwright locator for the QSelect component
 * @param valueOrTextOrIndex - Value, text content, or index of the option(s) to select
 */
export async function selectQSelectOption(
  element: Locator,
  valueOrTextOrIndex: string | number | Array<string | number>,
) {
  // Ensure the element is visible and enabled
  await expect(element).toBeVisible();
  await expect(element).not.toBeDisabled();

  const hasNativeSelect = await element.evaluate((el) =>
    el.classList.contains('q-field__native'),
  );
  // Handle .q-field__native elements by finding parent .q-select
  if (hasNativeSelect) {
    const parentQSelect = element.locator(
      'xpath=ancestor::*[contains(@class, "q-select")][1]',
    );
    if (await parentQSelect.count()) {
      element = parentQSelect;
    }
  }

  const isMultiple = await element.evaluate((el) =>
    el.classList.contains('q-select--multiple'),
  );
  const values = Array.isArray(valueOrTextOrIndex)
    ? valueOrTextOrIndex
    : [valueOrTextOrIndex];

  if (values.length === 0) {
    throw new Error('Playwright: select requires at least one value');
  }

  await element.click();

  // Wait for the menu to appear
  const menu = element.page().locator('.q-menu:visible');
  await expect(menu).toBeVisible();

  for (const value of values) {
    let option: Locator;
    if (typeof value === 'string') {
      option = menu.locator(`.q-item[role=option]:has-text("${value}")`);
    } else {
      option = menu.locator('.q-item[role=option]').nth(value);
    }

    await expect(option).toBeVisible();
    await option.click();

    if (!isMultiple) {
      break;
    }
  }
}

/**
 * Checks a Quasar checkbox, toggle, or radio component
 * @param element - Playwright locator for the component
 */
export async function checkQuasarComponent(element: Locator) {
  await expect(element).toBeVisible();
  await expect(element).not.toBeDisabled();

  const isCheckBased = await isCheckBasedComponent(element);
  if (!isCheckBased) {
    await element.check();
    return;
  }

  const checked = await element.getAttribute('aria-checked');
  if (checked !== 'true') {
    await element.click();

    // Verify the component was actually checked
    await expect(element).toHaveAttribute('aria-checked', 'true');
  }
}

/**
 * Unchecks a Quasar checkbox or toggle component
 * @param element - Playwright locator for the component
 */
export async function uncheckQuasarComponent(element: Locator) {
  await expect(element).toBeVisible();
  await expect(element).not.toBeDisabled();

  const isCheckBased = await isCheckBasedComponent(element);
  if (!isCheckBased) {
    await element.uncheck();
    return;
  }

  const checked = await element.getAttribute('aria-checked');
  if (checked !== 'false') {
    await element.click();

    // Verify the component was actually unchecked
    await expect(element).toHaveAttribute('aria-checked', 'false');
  }
}

/**
 * Asserts that a Quasar checkbox, toggle, or radio component is checked or unchecked
 * @param element - Playwright locator for the component
 * @param expected - Expected checked state (true = checked, false = unchecked)
 */
export async function expectQuasarChecked(
  element: Locator,
  expected: boolean,
) {
  await expect(element).toBeVisible();

  await expect(element).toHaveAttribute(
    'aria-checked',
    expected ? 'true' : 'false',
  );
}
