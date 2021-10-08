// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-e2e-cypress';
import { Dialog } from 'quasar';
// Example to import i18n from boot and use as plugin
// import { i18n } from 'src/boot/i18n';
import { config } from '@vue/test-utils';

// You can modify the global config here for all tests or pass in the configuration per test
// For example use the actual i18n instance or mock it
// config.global.plugins.push(i18n);
config.global.mocks = {
  $t: () => '',
};

// Overwrite the transition and transition-group stubs which are stubbed by test-utils by default.
// We do want transitions to show when doing visual testing :)
config.global.stubs = {};

installQuasarPlugin({ plugins: { Dialog } });

const resizeObserverLoopError = 'ResizeObserver loop limit exceeded';

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes(resizeObserverLoopError)) {
    // returning false here prevents Cypress from
    // failing the test
    return false;
  }
});
