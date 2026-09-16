import { test as base, type Locator, type Page } from '@playwright/test';
import { selectDate, type DateInput } from '../quasar/date';
import {
  closeDialog,
  dialogLocator,
  withinDialog,
  type CloseDialogVia,
  type DialogOptions,
  type WithinDialogOptions,
} from '../quasar/dialog';
import {
  menuLocator,
  openMenu,
  type MenuOptions,
  type OpenMenuOptions,
} from '../quasar/menu';
import {
  createSelectHandle,
  type PickOptions,
  type PickValue,
  type SelectHandle,
} from '../quasar/select';
import { collectCoverage } from './coverage';

export interface QuasarFixture {
  /** The top-most open QDialog, or the one matching the options. */
  dialog(options?: DialogOptions): Locator;
  /** Runs the callback against the dialog, then waits for it to close unless persistent. */
  withinDialog<T>(
    fn: (dialog: Locator) => Promise<T>,
    options?: WithinDialogOptions,
  ): Promise<T>;
  /**
   * Closes the dialog with Escape or a backdrop click, then waits for it to be
   * removed. Escape only reaches the top-most modal dialog and throws for any
   * other one. The backdrop click throws for a seamless dialog, which renders
   * no backdrop.
   */
  closeDialog(dialog: Locator, via?: CloseDialogVia): Promise<void>;
  /** The top-most open QMenu (QSelect menus excluded), or the one matching the options. */
  menu(options?: MenuOptions): Locator;
  /** Clicks the trigger and returns the QMenu that opened. */
  openMenu(trigger: Locator, options?: OpenMenuOptions): Promise<Locator>;
  /** A handle for the QSelect that owns the target (root or any inner element). */
  select(target: Locator): SelectHandle;
  /** Picks options by label (strings) or index (numbers). */
  selectOption(
    target: Locator,
    values: PickValue | PickValue[],
    options?: PickOptions,
  ): Promise<void>;
  /** Navigates the QDate that owns the target and clicks the day. Returns the day button. */
  selectDate(target: Locator, value: DateInput): Promise<Locator>;
}

/**
 * The helpers the `quasar` fixture yields, bound to the given page. Build them
 * for a page the fixture does not cover, a popup for instance.
 */
export function createQuasarFixture(page: Page): QuasarFixture {
  return {
    dialog: (options) => dialogLocator(page, options),
    withinDialog: (fn, options) => withinDialog(page, fn, options),
    closeDialog: (dialog, via) => closeDialog(dialog, via),
    menu: (options) => menuLocator(page, options),
    openMenu: (trigger, options) => openMenu(page, trigger, options),
    select: (target) => createSelectHandle(page, target),
    selectOption: (target, values, options) =>
      createSelectHandle(page, target).pick(values, options),
    selectDate: (target, value) => selectDate(target, value),
  };
}

/**
 * The worker-scoped options this test object adds. A playwright.config that
 * sets one types itself with defineConfig<object, QuasarWorkerOptions>().
 */
export interface QuasarWorkerOptions {
  /**
   * Turns the coverage collector on. The install writes "use: { coverage: true }"
   * into playwright.config when coverage is enabled.
   */
  coverage: boolean;
}

export const test = base.extend<
  { quasar: QuasarFixture; collectCoverage: void },
  QuasarWorkerOptions
>({
  coverage: [false, { option: true, scope: 'worker' }],

  collectCoverage: [
    async ({ coverage, page }, use, testInfo) => {
      // Reading page creates it. A request-only test must not pay for one.
      if (!coverage) {
        await use();
        return;
      }

      // A void fixture's use() takes a void argument. The wrapper drops it.
      await collectCoverage(page, () => use(), testInfo);
    },
    // Box hides the fixture from traces and the HTML report.
    { auto: true, box: true },
  ],

  quasar: async ({ page }, use) => {
    await use(createQuasarFixture(page));
  },
});
