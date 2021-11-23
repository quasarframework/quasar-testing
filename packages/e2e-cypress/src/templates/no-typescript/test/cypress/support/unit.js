// ***********************************************************
// This example support/unit.js is processed and
// loaded automatically before your unit test files.
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

import './commands';

// Change this if you have a different entrypoint for the main scss.
import 'src/css/app.scss';
// Quasar styles
import 'quasar/src/css/index.sass';

// ICON SETS
// If you use multiple or different icon-sets then the default, be sure to import them here.
import 'quasar/dist/icon-set/material-icons.umd.prod';
import '@quasar/extras/material-icons/material-icons.css';

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-e2e-cypress';
import { config } from '@vue/test-utils';
import { Dialog } from 'quasar';

// Example to import i18n from boot and use as plugin
// import { i18n } from 'src/boot/i18n';

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
