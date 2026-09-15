const SHARED_IMPORT_MESSAGE =
  'A module of src/shared runs in node and in the browser, so it imports nothing outside this directory.';

module.exports = {
  root: true,

  // The test apps manage their own linting (test-vite-app-v3 uses oxlint).
  // Without this, the IDE extension applies this config to their files.
  ignorePatterns: [
    '/test-vite-app-v3/',

    // App Extension templates hold EJS tags and belong to the app they scaffold.
    'packages/*/src/templates/',

    // The quality AE is plain JS and predates the TS setup, so every file it has
    // fails to parse with this config. It's ancient anyway, so we just ignore it.
    'packages/quality/',
  ],

  env: {
    node: true,
    es6: true, // Allows for the parsing of modern ECMAScript features
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
    // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
    // Each package is parsed with its own tsconfig, so a rule that needs type
    // information sees the same types as its package's tsc run.
    project: true,
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
    {
      // The ./gallery entry of the Playwright AE is loaded by the browser from
      // a generated page. It may import vue and its own files, nothing else.
      files: ['packages/playwright/src/gallery/**/*.ts'],
      excludedFiles: ['**/*.test.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ['#q-app', 'quasar', '@playwright/test', 'vite'].map(
              (name) => ({
                name,
                message:
                  'The gallery runtime runs in the browser and may import vue only.',
              }),
            ),
            patterns: [
              {
                group: ['node:*'],
                message:
                  'The gallery runtime runs in the browser and may import vue only.',
              },
            ],
          },
        ],
      },
    },
    {
      // src/shared holds what both sides import: the AE scripts in node and the
      // gallery runtime in the browser. Those modules import nothing at all.
      files: ['packages/playwright/src/shared/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ['vue', 'quasar', '#q-app', '@playwright/test', 'vite'].map(
              (name) => ({ name, message: SHARED_IMPORT_MESSAGE }),
            ),
            patterns: [
              { group: ['node:*', '../*'], message: SHARED_IMPORT_MESSAGE },
            ],
          },
        ],
      },
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
    'prefer-const': 'warn',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
  },
};
