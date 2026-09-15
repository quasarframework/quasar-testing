import { expect, type Locator, type Page } from '@playwright/test';
import { closestWithClass } from './root';

/*
  QSelect is a div-based combobox with its listbox in a portal, so Playwright's
  selectOption() cannot drive it. Facts this handle relies on, from the QSelect
  source. Last verified against Quasar 2.32.2. The QuasarSelect demo spec
  covers them.
  - the user's attributes go on the input[role=combobox], not on the root
  - aria-controls="<uid>_lb" is set only while the menu is open with options
  - options are role=option with id="<uid>_<index>"; only a slice of a long
    list is rendered (virtual scroll), the rest appears while scrolling
*/

export type PickValue = string | number;

export interface PickOptions {
  /** Match option labels exactly. Default true, so "Apple" does not match "Pineapple". */
  exact?: boolean;
  /** Leave a multiple QSelect open after picking. */
  keepOpen?: boolean;
}

export interface SelectHandle {
  root: Locator;
  combobox: Locator;
  listbox(): Promise<Locator>;
  options(): Promise<Locator>;
  open(): Promise<Locator>;
  close(): Promise<void>;
  pick(values: PickValue | PickValue[], options?: PickOptions): Promise<void>;
}

// Quasar re-slices the virtual list after a scroll event: 35 ms normally,
// 120 ms on iOS (the onVirtualScrollEvt debounce in use-virtual-scroll.js)
const VIRTUAL_SCROLL_RENDER_WAIT_MS = 150;
const MAX_VIRTUAL_SCROLL_PAGES = 200;
const LISTBOX_ID_SUFFIX = /_lb$/;
// How long open() waits for one click to take effect before clicking again
const OPEN_CLICK_RETRY_MS = 500;
// How long open() keeps retrying. It covers a slow async option load.
const OPEN_MENU_TIMEOUT_MS = 10000;

export function createSelectHandle(page: Page, target: Locator): SelectHandle {
  const root = closestWithClass(target, 'q-select');
  // On mobile platforms, or with behavior="dialog", the open menu renders
  // inside a dialog together with a copy of the field (QSelect.js getDialog()).
  // The combobox role moves to that copy while the dialog is open (the isTarget
  // branch of QSelect.js getControl()). Both copies have the same uid. The
  // in-page input comes before the portals in document order, so first() picks the
  // in-page combobox whenever it holds the role and the dialog copy otherwise.
  // During the 300 ms close transition both can hold the role at once.
  const combobox = root
    .locator('[role="combobox"]')
    .or(page.locator('.q-select__dialog [role="combobox"]'))
    .first();

  // The QSelect root which owns the combobox now, the in-page one or the dialog copy
  const fieldRoot = closestWithClass(combobox, 'q-select');

  // Both QSelect roots have for="<uid>", the id of the native input (use-field.js)
  async function targetUid() {
    const uid = await fieldRoot.getAttribute('for');
    if (uid === null) {
      throw new Error('The QSelect root has no target uid');
    }

    return uid;
  }

  async function listboxId() {
    const controls = await combobox.getAttribute('aria-controls');
    if (controls === null) {
      throw new Error('The QSelect menu is not open or has no options');
    }

    return controls;
  }

  async function listbox() {
    return page.locator(`[role="listbox"][id="${await listboxId()}"]`);
  }

  async function options() {
    return (await listbox()).getByRole('option');
  }

  // Quasar ignores a click while the select has no options, no "no-option"
  // slot and no no-option-label prop. The gate is showPopup() in QSelect.js.
  // A select that
  // loads its options after mount stays closed on the first click. The click
  // is repeated until the menu opens. toPass() has no default timeout. The
  // loop sets one.
  async function open() {
    if ((await fieldRoot.getAttribute('aria-disabled')) === 'true') {
      throw new Error('The QSelect is disabled');
    }

    await expect(async () => {
      if ((await combobox.getAttribute('aria-expanded')) !== 'true') {
        await fieldRoot.locator('.q-field__control').click();
      }

      await expect(combobox).toHaveAttribute('aria-expanded', 'true', {
        timeout: OPEN_CLICK_RETRY_MS,
      });
    }).toPass({ timeout: OPEN_MENU_TIMEOUT_MS });

    // aria-controls appears once the options are loaded and rendered
    await expect(combobox).toHaveAttribute('aria-controls', LISTBOX_ID_SUFFIX);

    return listbox();
  }

  // The dialog this select renders its options into on mobile platforms. The
  // lookup is scoped to this select's own target uid. ".q-select__dialog"
  // alone matches another open select's dialog too.
  async function ownDialog() {
    const uid = await targetUid();

    return page
      .locator('.q-select__dialog')
      .filter({ has: page.locator(`[id="${uid}"]`) });
  }

  // Waits out the dialog's close transition. QDialog keeps the dialog's field
  // copy mounted with role="combobox" until its leave transition finishes. A
  // raw getAttribute() call right after aria-expanded turns false can still
  // hit two matches. Call this after every close before reading combobox
  // attributes directly.
  async function waitForClosed() {
    const dialog = await ownDialog();

    await expect(combobox).toHaveAttribute('aria-expanded', 'false');
    await expect(dialog).toHaveCount(0);
  }

  async function close() {
    if ((await combobox.getAttribute('aria-expanded')) !== 'true') {
      return;
    }

    // The menu and, on mobile platforms, the dialog both close on Escape
    await page.keyboard.press('Escape');
    await waitForClosed();
  }

  async function scrollUntilRendered(box: Locator, option: Locator) {
    const scroller = box.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " scroll ")][1]',
    );

    if ((await option.count()) > 0) {
      return;
    }

    // The menu opens scrolled to the selected option, and each pick in a
    // multiple select leaves the list where the previous option was. Start
    // the sweep from the top so an option above the current position is
    // still found.
    await scroller.evaluate((element) => {
      element.scrollTop = 0;
    });
    await page.waitForTimeout(VIRTUAL_SCROLL_RENDER_WAIT_MS);

    for (let pageIndex = 0; pageIndex < MAX_VIRTUAL_SCROLL_PAGES; pageIndex++) {
      if ((await option.count()) > 0) {
        return;
      }

      const reachedEnd = await scroller.evaluate((element) => {
        const before = element.scrollTop;
        element.scrollTop += element.clientHeight;
        return element.scrollTop === before;
      });

      if (reachedEnd) {
        break;
      }

      await page.waitForTimeout(VIRTUAL_SCROLL_RENDER_WAIT_MS);
    }

    // The loop can exit right after a scroll (reachedEnd) without waiting, so
    // the last slice may not have rendered yet.
    await page.waitForTimeout(VIRTUAL_SCROLL_RENDER_WAIT_MS);

    if ((await option.count()) === 0) {
      throw new Error('The option is not in the QSelect menu');
    }
  }

  async function pick(
    values: PickValue | PickValue[],
    pickOptions: PickOptions = {},
  ) {
    const { exact = true, keepOpen = false } = pickOptions;
    const list = Array.isArray(values) ? values : [values];

    if (list.length === 0) {
      throw new Error('pick() needs at least one value');
    }

    const isMultiple = await fieldRoot.evaluate((element) =>
      element.classList.contains('q-select--multiple'),
    );
    if (list.length > 1 && !isMultiple) {
      throw new Error('Only a multiple QSelect accepts more than one value');
    }

    const box = await open();
    const uid = (await listboxId()).replace(LISTBOX_ID_SUFFIX, '');

    for (const value of list) {
      const option =
        typeof value === 'number'
          ? page.locator(`[role="option"][id="${uid}_${value}"]`)
          : box.getByRole('option', { name: value, exact });

      await scrollUntilRendered(box, option);

      if ((await option.getAttribute('aria-disabled')) === 'true') {
        throw new Error(`The option "${value}" is disabled`);
      }

      // clicking a selected option of a multiple select would deselect it
      if (
        isMultiple &&
        (await option.getAttribute('aria-selected')) === 'true'
      ) {
        continue;
      }

      await option.click();

      if (!isMultiple) {
        await waitForClosed();
        return;
      }

      await expect(option).toHaveAttribute('aria-selected', 'true');
    }

    if (!keepOpen) {
      await close();
    }
  }

  return { root, combobox, listbox, options, open, close, pick };
}
