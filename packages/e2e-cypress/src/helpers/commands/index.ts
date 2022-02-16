/* eslint-disable @typescript-eslint/triple-slash-reference */
// Normal imports are stripped away when building,
// we need these imports to force TS to evaluate augmentation in every single command file
/// <reference path="./color-assertions.ts" />
/// <reference path="./data-cy.ts" />
/// <reference path="./storage-helpers.ts" />
/// <reference path="./test-route.ts" />

import { registerColorAssertions } from './color-assertions';
import { registerDataCy } from './data-cy';
import { registerStorageHelpers } from './storage-helpers';
import { registerTestRoute } from './test-route';

export function registerCommands() {
  registerColorAssertions();
  registerDataCy();
  registerStorageHelpers();
  registerTestRoute();

  // Not a command, but a common known problem with Cypress
  // We add it here since it's needed for both e2e and unit tests
  // Usually it should be placed into `cypress/support/index.ts` file
  // See https://github.com/quasarframework/quasar/issues/2233#issuecomment-492975745
  const resizeObserverLoopError = 'ResizeObserver loop limit exceeded';
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes(resizeObserverLoopError)) {
      // returning false here prevents Cypress from failing the test
      return false;
    }
  });
}
