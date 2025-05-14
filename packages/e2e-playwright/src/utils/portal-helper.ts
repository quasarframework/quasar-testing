import { expect, Locator, Page } from '@playwright/test';

/**
 * Callback function that operates on a locator within a portal
 * @typeParam T - Return type of the callback function, defaults to void
 */
export type WithinPortalCallback<T = void> = (
  locator: Locator,
) => T | Promise<T>;

/**
 * Configuration options for portal derivate commands
 */
export interface WithinPortalDerivateOptions {
  /**
   * The data-testid attribute value to target specific elements
   */
  dataTest?: string;

  /**
   * If true, doesn't expect the portal to be hidden after the callback is executed
   */
  persistent?: boolean;

  /**
   * Custom selector to override the default selector
   */
  selector?: string;

  /**
   * Callback function to execute within the portal
   */
  fn: WithinPortalCallback;
}

/**
 * Generic command to interact with portals in Quasar components (dialogs, menus, etc.)
 *
 * @param page - Playwright Page or Locator to search within
 * @param selectorDefault - Default CSS selector for the portal
 * @param selectorSuffixes - Additional selectors to append to the base selector
 * @param fnOrOptions - Callback function or options for interacting with the portal
 * @returns Locator for the portal element
 */
export async function portalDerivateCommand(
  page: Locator | Page,
  selectorDefault: string,
  selectorSuffixes: string | string[],
  fnOrOptions: WithinPortalCallback | WithinPortalDerivateOptions,
): Promise<Locator> {
  const selectorSuffixesArray = Array.isArray(selectorSuffixes)
    ? selectorSuffixes
    : [selectorSuffixes];

  const {
    dataTest = '',
    persistent = false,
    selector = selectorDefault,
  } = typeof fnOrOptions === 'function' ? {} : fnOrOptions;

  const fn = typeof fnOrOptions === 'function' ? fnOrOptions : fnOrOptions.fn;

  const portalSelector = selectorSuffixesArray
    .map((selectorSuffix) => {
      // This is the selector used by getTestById(), it is likely not going to change anytime soon because of the number of projects that will break
      // So we should be fine using it here this way.
      const testId = `[data-testid="${dataTest}"]`;

      return dataTest
        ? `${testId}${selectorSuffix}`
        : `${selector}${selectorSuffix}`;
    })
    .join(',');

  const locator = page.locator(portalSelector);

  // Wait for exactly one matching dialog to be present in the DOM.
  await expect(locator).toHaveCount(1);

  // Execute the callback with the first (and only) located element
  await fn(locator.first());

  // If not persistent, verify that the portal has been closed/hidden
  if (!persistent) {
    await expect(locator).not.toBeVisible();
  }

  return locator;
}
