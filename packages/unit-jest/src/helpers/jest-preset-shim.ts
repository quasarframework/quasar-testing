// This module provide typings to the deep import, since the original file isn't written in TS
// This should be a .ts file (instead of a .d.ts) to not being elided at compile time by TS,
// which would make it useless
declare module '@quasar/quasar-app-extension-testing-unit-jest/jest-preset.mjs' {
  import { Config } from 'jest';

  export const quasarEsModulesPackageNames: string;
  export const config: Config;
  export default Config;
}
