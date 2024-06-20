import { defaults } from 'jest-config';
import hq from 'alias-hq';

export const quasarEsModulesPackageNames = [
  'quasar',
  'quasar/lang',
  'lodash-es',
].join('|');

const aliases = hq.get('jest', { format: 'array' });
// "^vue$$" alias points to an ESM bundler build which Jest would need to transpile or re-map to CJS
// Currently this this alias isn't even defined into TS codebases
delete aliases['^vue$$'];

/** @type {import('jest').Config} */
export const config = {
  globals: {
    __DEV__: true,
  },
  // Jest assumes we are testing in node environment, specify jsdom environment instead
  testEnvironment: 'jsdom',
  // Enforce Jest to use CJS build, instead of browser one
  // https://jestjs.io/docs/configuration#testenvironmentoptions-object
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  coverageDirectory: '<rootDir>/test/jest/coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.{vue,js,ts,jsx,tsx}'],
  coveragePathIgnorePatterns: ['/node_modules/', '.d.ts$'],
  testMatch: [
    // Matches tests in any subfolder of 'src' or into 'test/jest/__tests__'
    // Matches all files with extension 'js', 'jsx', 'ts' and 'tsx'
    '<rootDir>/test/jest/__tests__/**/*.(spec|test).+(ts|js)?(x)',
    '<rootDir>/src/**/*.jest.(spec|test).+(ts|js)?(x)',
  ],
  // Extension-less imports of components are resolved to .ts files by TS,
  //  grating correct type-checking in test files.
  // Being 'vue' the first moduleFileExtension option, the very same imports
  //  will be resolved to .vue files by Jest, if both .vue and .ts files are
  //  in the same folder.
  // This guarantee a great dev experience both for testing and type-checking.
  // See https://github.com/vuejs/vue-jest/issues/188#issuecomment-620750728
  moduleFileExtensions: ['vue', ...defaults.moduleFileExtensions],
  moduleNameMapper: {
    // Quasar CJS export is SSR-only, so we need to use ESM build and transpile it with Babel
    // From Quasar 2.16 onwards, the ESM build file name changed and thus we need to check both names
    // See https://github.com/quasarframework/quasar/issues/17184#issuecomment-2158497588
    '^quasar$': ['quasar/dist/quasar.esm.prod.js', 'quasar/dist/quasar.client.js'],
    '^~/(.*)$': '<rootDir>/$1',
    '.*css$': '@quasar/quasar-app-extension-testing-unit-jest/stub.css',
    ...aliases,
  },
  transform: {
    '.*\\.vue$': [
      '@vue/vue3-jest',
      {
        // TODO: Remove if resolved natively
        // See https://github.com/vuejs/vue-jest/issues/175
        pug: { doctype: 'html' },
      },
    ],
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
  // https://jestjs.io/docs/configuration#transformignorepatterns-arraystring
  transformIgnorePatterns: [
    `node_modules/(?!(${quasarEsModulesPackageNames}))`,
    `node_modules/.pnpm/(?!(${quasarEsModulesPackageNames})@)`,
  ],
};

export default config;
