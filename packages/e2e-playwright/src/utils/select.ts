import { expect, Locator } from '@playwright/test';

async function isCheckBasedComponent(element: Locator): Promise<boolean> {
  const className = await element.getAttribute('class');
  return ['q-checkbox', 'q-toggle', 'q-radio'].some((item) =>
    className?.includes(item),
  );
}

export async function selectQSelectOption(
  element: Locator,
  valueOrTextOrIndex: string | number | Array<string | number>,
) {
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
  const menu = element.page().locator('.q-menu:visible');

  for (const value of values) {
    let option: Locator;
    if (typeof value === 'string') {
      option = menu.locator(`.q-item[role=option]:has-text("${value}")`);
    } else {
      option = menu.locator('.q-item[role=option]').nth(value);
    }

    await option.waitFor();
    await option.click();

    if (!isMultiple) {
      break;
    }
  }
}

export async function checkQuasarComponent(element: Locator) {
  const isCheckBased = await isCheckBasedComponent(element);
  if (!isCheckBased) {
    await element.check();
    return;
  }
  const checked = await element.getAttribute('aria-checked');
  if (checked !== 'true') {
    await element.click();
  }
}

export async function uncheckQuasarComponent(element: Locator) {
  const isCheckBased = await isCheckBasedComponent(element);
  if (!isCheckBased) {
    await element.uncheck();
    return;
  }
  const checked = await element.getAttribute('aria-checked');
  if (checked !== 'false') {
    await element.click();
  }
}

export async function expectQuasarChecked(element: Locator, expected: boolean) {
  await expect(element).toHaveAttribute(
    'aria-checked',
    expected ? 'true' : 'false',
  );
}
