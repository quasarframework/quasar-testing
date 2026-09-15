import type { Locator, Page } from '@playwright/test';
import { waitForNewPortal } from './portal';

export interface MenuOptions {
  /** Test id set on the QMenu. Quasar forwards it to the .q-menu root. */
  testId?: string;
  hasText?: string | RegExp;
  /** false picks the first matching menu instead of the top-most (last) one. */
  last?: boolean;
}

export interface OpenMenuOptions {
  /** Right-click the trigger, for QMenu with the context-menu prop. */
  contextMenu?: boolean;
}

// QSelect renders its options through a QMenu too. Its listbox tells them apart.
const MENU_SELECTOR = '.q-menu:not(:has([role="listbox"]))';

export function menuLocator(page: Page, options: MenuOptions = {}): Locator {
  let menus = page.locator(MENU_SELECTOR);

  if (options.testId !== undefined) {
    menus = menus.and(page.getByTestId(options.testId));
  }

  if (options.hasText !== undefined) {
    menus = menus.filter({ hasText: options.hasText });
  }

  return options.last === false ? menus.first() : menus.last();
}

export async function openMenu(
  page: Page,
  trigger: Locator,
  options: OpenMenuOptions = {},
): Promise<Locator> {
  const container = await waitForNewPortal(page, 'menu', () =>
    trigger.click(options.contextMenu ? { button: 'right' } : {}),
  );

  return container.locator(':scope > .q-menu');
}
