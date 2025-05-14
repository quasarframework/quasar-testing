import { expect, Locator } from '@playwright/test';


/**
 * Asserts that an element has the expected color style property
 * @param locator - Playwright locator for the element
 * @param property - CSS color property to check ('color' or 'background-color')
 * @param expectedStyle - Expected color value
 */
export async function expectColorStyle(
  locator: Locator,
  property: 'color' | 'background-color',
  expectedStyle: string,
) {
  const page = locator.page();

  // Wait for the element to be visible before checking colors
  await expect(locator).toBeVisible();

  const actualStyle = await page.evaluate(
    ({ selector, property }) => {
      const element = document.querySelector(selector);
      if (!element || !(element instanceof HTMLElement)) {
        return;
      }

      const computedStyle = getComputedStyle(element);
      return computedStyle.getPropertyValue(property);
    },
    {
      selector: await locator.evaluate((el) => {
        el.id = 'temp-element';

        return `#${el.id}`;
      }),
      property,
    },
  );

  expect(actualStyle).toBe(expectedStyle);
}

/**
 * Asserts that an element has the expected text color
 * @param locator - Playwright locator for the element
 * @param expectedColor - Expected color value
 */
export function expectColor(locator: Locator, expectedColor: string) {
  return expectColorStyle(locator, 'color', expectedColor);
}

/**
 * Asserts that an element has the expected background color
 * @param locator - Playwright locator for the element
 * @param expectedBackground - Expected background color value
 */
export function expectBackgroundColor(locator: Locator, expectedBackgrouind: string) {
  return expectColorStyle(locator, 'background-color', expectedBackgrouind);
}
