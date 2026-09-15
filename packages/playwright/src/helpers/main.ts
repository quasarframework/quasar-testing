import { expect as baseExpect } from '@playwright/test';
import { colorMatchers } from './matchers/color';
import { routeMatchers } from './matchers/route';

export { createQuasarFixture, test } from './fixtures/quasar';
export type { QuasarFixture, QuasarWorkerOptions } from './fixtures/quasar';
export type { DateInput, DateParts } from './quasar/date';
export type {
  CloseDialogVia,
  DialogOptions,
  WithinDialogOptions,
} from './quasar/dialog';
export type { MenuOptions, OpenMenuOptions } from './quasar/menu';
export type { PickOptions, PickValue, SelectHandle } from './quasar/select';
export type { ColorMatcherOptions } from './matchers/color';
export type { RouteMatcherOptions } from './matchers/route';

/**
 * Playwright's expect with the Quasar matchers. The scaffolded fixtures file
 * re-exports it. It types each matcher on its receiver: toHaveRoute on a Page,
 * toHaveColor and toHaveBackgroundColor on a Locator.
 */
export const expect = baseExpect.extend({
  ...colorMatchers,
  ...routeMatchers,
});
