/*
  Every module in this directory runs in node and in the browser: the AE
  scripts import them, and the gallery runtime bundles them. They may import
  nothing. No node built-ins, no vue, no quasar, no vite. The eslint config
  enforces that, see the zone for src/shared in .eslintrc.js.
*/

export * from './constants';
export * from './quote';
export * from './story-id';
