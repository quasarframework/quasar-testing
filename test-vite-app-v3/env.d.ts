/**
 * Add types (that are not auto-magically added by Quasar CLI already)
 * for your custom variables to avoid TypeScript errors, like dynamic
 * process.env variables or definitions in dotenv files configured ONLY
 * for the /quasar.config file itself.
 *
 * https://quasar.dev/quasar-cli-vite/handling-import-meta-env#type-inference
 *
 * @example
 * interface ImportMetaEnv {
 *   readonly MY_VAR: string;
 *   readonly MY_OTHER_VAR: string;
 * }
 */
interface ImportMetaEnv {}
