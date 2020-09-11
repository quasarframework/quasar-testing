const esModules = ["quasar/lang", "lodash-es"].join("|");

module.exports = {
  globals: {
    __DEV__: true,
  },
  setupFilesAfterEnv: ["<rootDir>/test/jest/jest.setup.js"],
  // noStackTrace: true,
  // bail: true,
  // cache: false,
  // verbose: true,
  // watch: true,
  collectCoverage: true,
  coverageDirectory: "<rootDir>/test/jest/coverage",
  collectCoverageFrom: [
    "<rootDir>/src/**/*.vue",
    "<rootDir>/src/**/*.js",
    "<rootDir>/src/**/*.jsx",
  ],
  // Needed in JS codebases too because of feature flags
  coveragePathIgnorePatterns: ["/node_modules/", ".d.ts$"],
  coverageThreshold: {
    global: {
      //  branches: 50,
      //  functions: 50,
      //  lines: 50,
      //  statements: 50
    },
  },
  testMatch: [
    "<rootDir>/test/jest/__tests__/**/*.(spec|test).js",
    "<rootDir>/src/**/*.jest.(spec|test).js",
  ],
  moduleFileExtensions: ["vue", "js", "jsx", "json"],
  moduleNameMapper: {
    "^vue$": "<rootDir>/node_modules/vue/dist/vue.common.js",
    "^test-utils$":
      "<rootDir>/node_modules/@vue/test-utils/dist/vue-test-utils.js",
    "^quasar$": "<rootDir>/node_modules/quasar/dist/quasar.common.js",
    "^~/(.*)$": "<rootDir>/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
    ".*css$": "@quasar/quasar-app-extension-testing-unit-jest/stub.css",
  },
  transform: {
    ".*\\.vue$": "vue-jest",
    ".*\\.js$": "babel-jest",
    ".+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
    // use these if NPM is being flaky
    // '.*\\.vue$': '<rootDir>/node_modules/@quasar/quasar-app-extension-testing-unit-jest/node_modules/vue-jest',
    // '.*\\.js$': '<rootDir>/node_modules/@quasar/quasar-app-extension-testing-unit-jest/node_modules/babel-jest'
  },
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!(${esModules}))`],
  snapshotSerializers: ["<rootDir>/node_modules/jest-serializer-vue"],
};
