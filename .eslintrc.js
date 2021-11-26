const { resolve } = require('path');
module.exports = {
  root: true,

  env: {
    node: true,
    es6: true, // Allows for the parsing of modern ECMAScript features
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
    // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
    project: resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },

  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',

    // https://github.com/prettier/eslint-config-prettier#installation
    // usage with Prettier, provided by 'eslint-config-prettier'.
    'prettier',
  ],

  overrides: [
    {
      files: ['**/*.ts'],
      extends: [
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
        // ESLint typescript rules
        'plugin:@typescript-eslint/recommended',
        // consider disabling this class of rules if linting takes too long
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      plugins: [
        // required to apply rules which need type information
        '@typescript-eslint',
      ],
    },
  ],

  plugins: [
    // Prettier has not been included as plugin to avoid performance impact
    // add it as an extension for your IDE
  ],

  globals: {
    process: true,
  },

  // add your custom rules here
  rules: {
    curly: 'error',
    'no-else-return': ['warn', { allowElseIf: false }],
    eqeqeq: 'error',
    'no-alert': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'warn',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
  },
};
