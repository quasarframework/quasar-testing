import { expect, type Locator, type Page } from '@playwright/test';
import {
  BACKDROP_CLICK_POSITION,
  portalContainerOf,
  waitForPortalClosed,
} from './portal';

export interface DialogOptions {
  /** Test id set on the QDialog. Quasar forwards it to the .q-dialog root. */
  testId?: string;
  /** Accessible name, e.g. from an aria-label on the QDialog. */
  name?: string | RegExp;
  /** false picks the first matching dialog instead of the top-most (last) one. */
  last?: boolean;
}

export interface WithinDialogOptions extends DialogOptions {
  /** Skip the "dialog closed" wait after the callback. */
  persistent?: boolean;
}

export type CloseDialogVia = 'escape' | 'backdrop';

const DIALOG_PORTAL_INDEX_PATTERN = /^q-portal--dialog--(\d+)$/;

export function dialogLocator(
  page: Page,
  options: DialogOptions = {},
): Locator {
  let dialogs = page.locator('.q-dialog[role="dialog"]');

  if (options.testId !== undefined) {
    dialogs = dialogs.and(page.getByTestId(options.testId));
  }

  if (options.name !== undefined) {
    dialogs = dialogs.and(page.getByRole('dialog', { name: options.name }));
  }

  return options.last === false ? dialogs.first() : dialogs.last();
}

export async function withinDialog<T>(
  page: Page,
  fn: (dialog: Locator) => Promise<T>,
  options: WithinDialogOptions = {},
): Promise<T> {
  const { persistent = false, ...dialogOptions } = options;
  const dialog = dialogLocator(page, dialogOptions);

  await expect(dialog).toBeVisible();
  const { container } = await portalContainerOf(dialog);

  const result = await fn(dialog);

  if (!persistent) {
    await waitForPortalClosed(container);
  }

  return result;
}

// Indexes of the portal containers holding a dialog that Quasar's Escape
// handler can reach. Quasar puts "q-dialog--modal" on the root of every dialog
// that is showing and is not seamless, and removes it during the hide
// transition.
async function modalDialogIndexes(page: Page): Promise<number[]> {
  const containerIds = await page
    .locator('.q-dialog.q-dialog--modal')
    .evaluateAll((elements) =>
      elements.map(
        (element) => element.closest('[id^="q-portal--dialog--"]')?.id ?? '',
      ),
    );

  return containerIds.flatMap((containerId) => {
    const indexMatch = DIALOG_PORTAL_INDEX_PATTERN.exec(containerId);
    return indexMatch === null ? [] : [Number(indexMatch[1])];
  });
}

// Escape reaches the top-most modal dialog. Pressing it for a dialog
// underneath closes the wrong one. closeDialog() then waits for a container
// that never detaches.
async function assertTopMostDialog(page: Page, containerId: string) {
  const indexMatch = DIALOG_PORTAL_INDEX_PATTERN.exec(containerId);
  if (indexMatch === null) {
    throw new Error(
      `closeDialog(): expected a QDialog, but the element sits in "${containerId}"`,
    );
  }

  // A dialog missing from this list carries no "q-dialog--modal" class. It is
  // seamless, or already closing.
  const modalIndexes = await modalDialogIndexes(page);
  const index = Number(indexMatch[1]);

  if (!modalIndexes.includes(index)) {
    throw new Error(
      'closeDialog(): Escape does not reach seamless dialogs, use a close button inside it',
    );
  }

  if (index !== Math.max(...modalIndexes)) {
    throw new Error(
      'closeDialog(): Escape only closes the top-most dialog, and this one is not on top',
    );
  }
}

export async function closeDialog(
  dialog: Locator,
  via: CloseDialogVia = 'escape',
) {
  const page = dialog.page();
  const { container, containerId } = await portalContainerOf(dialog);

  if (via === 'escape') {
    await assertTopMostDialog(page, containerId);

    // Quasar handles Escape on keyup, press() sends both events
    await page.keyboard.press('Escape');
  } else {
    const backdrop = dialog.locator('.q-dialog__backdrop');
    if ((await backdrop.count()) === 0) {
      throw new Error(
        'closeDialog(): this dialog has no backdrop and does not handle Escape (seamless dialogs), use a close button inside it',
      );
    }

    await backdrop.click({ position: BACKDROP_CLICK_POSITION });
  }

  await waitForPortalClosed(container);
}
