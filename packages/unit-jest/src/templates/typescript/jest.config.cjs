const { defaults } = require('jest-config');

const esModules = ['quasar', 'quasar/lang', 'lodash-es'].join('|');

/** @type {import('jest').Config} */
const config = {
  globals: {
    __DEV__: true,
  },
  // Jest assumes we are testing in node environment, specify jsdom environment instead
  testEnvironment: 'jsdom',
  // noStackTrace: true,
  // bail: true,
  // cache: false,
  // verbose: true,
  // watch: true,
  collectCoverage: false,
  coverageDirectory: '<rootDir>/test/jest/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.vue',
    '<rootDir>/src/**/*.js',
    '<rootDir>/src/**/*.ts',
    '<rootDir>/src/**/*.jsx',
    '<rootDir>/src/**/*.tsx',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '.d.ts$'],
  coverageThreshold: {
    global: {
      //  branches: 50,
      //  functions: 50,
      //  lines: 50,
      //  statements: 50
    },
  },
  testMatch: [
    // Matches tests in any subfolder of 'src' or into 'test/jest/__tests__'
    // Matches all files with extension 'js', 'jsx', 'ts' and 'tsx'
    '<rootDir>/test/jest/__tests__/**/*.(spec|test).+(ts|js)?(x)',
    '<rootDir>/src/**/*.jest.(spec|test).+(ts|js)?(x)',
  ],
  // Extension-less imports of components are resolved to .ts files by TS,
  //  granting correct type-checking in test files.
  // Being 'vue' the first moduleFileExtension option, the very same imports
  //  will be resolved to .vue files by Jest, if both .vue and .ts files are
  //  in the same folder.
  // This guarantee a great dev experience both for testing and type-checking.
  // See https://github.com/vuejs/vue-jest/issues/188#issuecomment-620750728
  moduleFileExtensions: ['vue', ...defaults.moduleFileExtensions],
  moduleNameMapper: {
    '^quasar$': 'quasar/dist/quasar.esm.prod.js',
    '^~/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^stores/(.*)$': '<rootDir>/src/stores/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^boot/(.*)$': '<rootDir>/src/boot/$1',
    '.*css$': '@quasar/quasar-app-extension-testing-unit-jest/stub.css',
  },
  transform: {
    // See https://jestjs.io/docs/en/configuration.html#transformignorepatterns-array-string
    [`^(${esModules}).+\\.js$`]: 'babel-jest',
    '^.+\\.(ts|js|html)$': [
      'ts-jest',
      {
        // Remove if using `const enums`
        // See https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules/
        isolatedModules: true,
      },
    ],
    '.*\\.vue$': [
      'vue-jest',
      {
        // TODO: Remove if resolved natively
        // See https://github.com/vuejs/vue-jest/issues/175
        pug: { doctype: 'html' },
      },
    ],
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
  transformIgnorePatterns: [`node_modules/(?!(${esModules}))`],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
};

module.exports = config;
