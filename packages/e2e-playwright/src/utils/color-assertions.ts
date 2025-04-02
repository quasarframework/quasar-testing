import { expect, Locator } from '@playwright/test';

export async function expertStyle(
  locator: Locator,
  property: 'color' | 'background-color',
  expectedStyle: string,
) {
  const page = locator.page();

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

        return `#temp-element`;
      }),
      property,
    },
  );

  expect(actualStyle).toBe(expectedStyle);
}

export function expectColor(locator: Locator, expectedColor: string) {
  return expertStyle(locator, 'color', expectedColor);
}

export function backgroundColor(locator: Locator, expectedBackgrouind: string) {
  return expertStyle(locator, 'background-color', expectedBackgrouind);
}
