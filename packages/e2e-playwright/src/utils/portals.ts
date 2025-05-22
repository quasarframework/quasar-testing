import { Locator, Page } from '@playwright/test';
import {
  portalDerivateCommand,
  WithinPortalCallback,
  WithinPortalDerivateOptions,
} from './portal-helper.js';

export async function withinDialog(
  page: Page,
  fnOrOptions: WithinPortalCallback | WithinPortalDerivateOptions,
) {
  return portalDerivateCommand(page, '.q-dialog', '', fnOrOptions);
}

export async function withinMenu(
  page: Page,
  fnOrOptions: WithinPortalCallback | WithinPortalDerivateOptions,
) {
  return portalDerivateCommand(
    page,
    '.q-menu',
    [':not([role])', '[role=menu]'],
    fnOrOptions,
  );
}

export async function withinSelectMenu(
  subject: Page | Locator,
  fnOrOptions: WithinPortalCallback | WithinPortalDerivateOptions,
) {
  return portalDerivateCommand(
    subject,
    '.q-menu',
    '[role=listbox]',
    fnOrOptions,
  );
}
