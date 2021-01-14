const esModules = ['quasar/lang', 'lodash-es'].join('|');

module.exports = {
  globals: {
    __DEV__: true,
    // TODO: Remove if resolved natively https://github.com/vuejs/vue-jest/issues/175
    'vue-jest': {
      pug: { doctype: 'html' },
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/jest/jest.setup.js'],
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
    '<rootDir>/src/**/*.jsx',
  ],
  // Needed in JS codebases too because of feature flags
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
    '<rootDir>/test/jest/__tests__/**/*.(spec|test).js',
    '<rootDir>/src/**/*.jest.(spec|test).js',
  ],
  moduleFileExtensions: ['vue', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^vue$': 'vue/dist/vue.common.js',
    '^test-utils$': '@vue/test-utils/dist/vue-test-utils.js',
    '^quasar$': 'quasar/dist/quasar.common.js',
    '^~/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '.*css$': '@quasar/quasar-app-extension-testing-unit-jest/stub.css',
  },
  transform: {
    '.*\\.vue$': 'vue-jest',
    '.*\\.js$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    // use these if NPM is being flaky, care as hosting could interfere with these
    // '.*\\.vue$': '@quasar/quasar-app-extension-testing-unit-jest/node_modules/vue-jest',
    // '.*\\.js$': '@quasar/quasar-app-extension-testing-unit-jest/node_modules/babel-jest'
  },
  transformIgnorePatterns: [`node_modules/(?!(${esModules}))`],
  snapshotSerializers: ['jest-serializer-vue'],
};
