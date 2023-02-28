/**
 * Types are not supported for `@cypress/code-coverage`
 *
 * @see https://github.com/cypress-io/code-coverage/issues/257
 */
declare module '@cypress/code-coverage/task' {
  export default function registerCodeCoverageTasks(
    on: Cypress.PluginEvents,
    config: Cypress.PluginConfigOptions,
  ): void;
}
