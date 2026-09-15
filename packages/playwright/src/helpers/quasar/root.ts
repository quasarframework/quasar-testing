import type { Locator } from '@playwright/test';

/**
 * The nearest element with the class, starting from the element itself. Quasar moves user
 * attributes such as data-testid onto inner elements for some components, so a
 * getByTestId() locator often points below the component root.
 */
export function closestWithClass(locator: Locator, className: string): Locator {
  return locator.locator(
    `xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " ${className} ")][1]`,
  );
}
