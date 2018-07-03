/* eslint-disable */

module.exports =
  {
    'globals': {
      '__DEV__': true
    },
    'collectCoverage': true,
    'collectCoverageFrom': [
      '<rootDir>/src/**/*.{js}',
      '<rootDir>/src/**/*.{vue}'
    ],
    'coverageDirectory': '<rootDir>/test/coverage',
    'coverageThreshold': {
      'global': {
        'branches': 50,
        'functions': 50,
        'lines': 50,
        'statements': 50
      },
      './src/components/': {
        'branches': 40,
        'statements': 40
      },
      './src/reducers/**/*.js': {
        'statements': 90,
      }
    },
    'testMatch': [
      '<rootDir>/test/**/?(*.)(spec).js?(x)',
      '<rootDir>/test/**/?(*.)(test).js?(x)'
    ],
    'testPathIgnorePatterns': [
      '<rootDir>/components/coverage/'
    ],
    'moduleFileExtensions': [
      'js',
      'json',
      'vue'
    ],
    'moduleNameMapper': {
      'src/components/([^\\.]*).vue$': '<rootDir>/src/components/$1.vue',
      'src/components/([^\\.]*)$': '<rootDir>/src/components/$1.js',
      '^vue$': 'vue/dist/vue.common.js',
      'src/([^\\.]*)$': '<rootDir>/src/$1.js',
      'src/([^\\.]*).vue$': '<rootDir>/src/$1.vue',
      '(.*)/(.*).vue$': '$1/$2.vue',
      'quasar': 'quasar-framework/dist/umd/quasar.mat.umd.min.js'
    },
    'transformIgnorePatterns': [
      'node_modules/core-js',
      'node_modules/babel-runtime',
      'node_modules/lodash',
      'node_modules/vue'
    ],
    'transform': {
      '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
      '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest'
    },
    'snapshotSerializers': [
      '<rootDir>/node_modules/jest-serializer-vue'
    ]
  }
