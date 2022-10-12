// Exporting `injectDevServer` function from `helpers/index.ts` as other helpers
// added Node-based side effects to the package
// Other exported member are meant to be run into browser context,
// so these side effects broke the code execution when launching cct tests

// We now export injectDevServer helper by building it in a separate step to avoid those side-effects
// Yet, TS isn't really deep-imports friendly: we can define only one types entry point, which means
// all deep imports types should be defined via ambient modules declarations, such as this one,
// which should then be referenced by the main types entry point to be correctly evaluated

// This module provide typings to the deep import, which is generated without own types,
// and match the output folder of the i18n build step. It cannot reference the related module
// or it would import it at compile time

// This should be a .ts file (instead of a .d.ts) to not being elided at compile time by TS,
// which would make it useless

// The solution we fould is a bit esoteric, but at least works
// Prior to this we tried to fetch all Node related packages as async imports,
// but this did not fix the pollution as hoped
// When TS will support native ESM modules, which allow multiple entry points,
// we should be able to remove this workaround and rely on something much simpler

declare module '@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server' {
  function injectQuasarDevServerConfig(): Cypress.DevServerConfigOptions;
}
