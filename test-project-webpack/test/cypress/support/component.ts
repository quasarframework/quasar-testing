// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your component test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'component.supportFile' configuration option.
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
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/dist/icon-set/material-icons.umd.prod';

import { Quasar, Dialog } from 'quasar';

import { mount } from 'cypress/vue';
import type { CyMountOptions } from 'cypress/vue';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Helper mount function for Vue Components
       * @param component Vue Component or JSX Element to mount
       * @param options Options passed to Vue Test Utils
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mount(component: any, options?: CyMountOptions<unknown>): Chainable<any>;
    }
  }
}

Cypress.Commands.add(
  'mount',
  (component, options: CyMountOptions<unknown> = {}) => {
    options.global = options.global || {};
    options.global.stubs = options.global.stubs || {};
    options.global.components = options.global.components || {};
    options.global.plugins = options.global.plugins || [];
    options.global.mocks = options.global.mocks || {};

    options.global.plugins.unshift([Quasar, { plugins: { Dialog } }]); //

    return mount(component, options);
  }
);
