import { expect, Locator, Page } from '@playwright/test';

export type WithinPortalCallback<T = void> = (
  locator: Locator,
) => T | Promise<T>;

export interface WithinPortalDerivateOptions {
  dataTest?: string;
  persistent?: boolean;
  selector?: string;
  fn: WithinPortalCallback;
}

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

  await expect(locator).toHaveCount(1);
  await fn(locator.first());

  if (!persistent) {
    await expect(locator).not.toBeVisible();
  }

  return locator;
}
