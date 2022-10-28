import { esModules } from '@quasar/quasar-app-extension-testing-unit-jest';

/** @type {import('jest').Config} */
export default {
  preset: '@quasar/quasar-app-extension-testing-unit-jest',
  // collectCoverage: true,
  // coverageThreshold: {
  //   global: {
  //      branches: 50,
  //      functions: 50,
  //      lines: 50,
  //      statements: 50
  //   },
  // },
  transform: {
    [`^(${esModules}).+\\.js$`]: 'babel-jest',
    '^.+\\.(ts|js|html)$': [
      'ts-jest',
      {
        // Remove if using `const enums`
        // See https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules/
        isolatedModules: true,
      },
    ],
  },
  // https://jestjs.io/docs/configuration#transformignorepatterns-arraystring
  // Note that this must be adapted as explained in the link above if you're using PNPM
  transformIgnorePatterns: [`node_modules/(?!(${esModules}))`],
};
