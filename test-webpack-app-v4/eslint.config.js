import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import pluginQuasar from '@quasar/app-webpack/eslint';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript';
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import pluginCypress from 'eslint-plugin-cypress/flat';

const config = defineConfigWithVueTs(
  {
    /**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    // ignores: []
  },

  pluginQuasar.configs.recommended(),
  js.configs.recommended,

  /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs.base
   *   -> Settings and rules to enable correct ESLint parsing.
   * pluginVue.configs[ 'flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs["flat/strongly-recommended"]
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs["flat/recommended"]
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
  pluginVue.configs['flat/essential'],

  // this rule needs to be above the vueTsEslintConfig to avoid error: 'You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file.'
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
    },
  },
  // https://github.com/vuejs/eslint-config-typescript
  vueTsConfigs.recommendedTypeChecked,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        process: 'readonly', // process.env.*
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly', // BEX related
      },
    },

    // add your custom rules here
    rules: {
      'prefer-promise-reject-errors': 'off',

      // allow debugger during development only
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },

  {
    files: ['src-pwa/custom-service-worker.ts'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  prettierSkipFormatting,

  {
    name: 'custom/cypress',

    files: ['**/*.cy.{js,jsx,ts,tsx}'],
    extends: [
      // Add Cypress-specific lint rules, globals and Cypress plugin
      // See https://github.com/cypress-io/eslint-plugin-cypress#rules
      pluginCypress.configs.recommended,
    ],
    rules: {
      // Allow chai-style assertions, e.g. `expect(foo).to.be.true`
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
);

// FIXME: quick-fix due to Vue plugin disabling these rules without allowing for a way to customize them
// We're waiting for an answer from the Vue team, because type-aware linting rules are automatically extracted by them and injected before
// the TS plugin parser configuration, in order to be able to apply them to Vue files.
// See https://github.com/vuejs/eslint-config-typescript/blob/e5b983369bee342e3fb0d9141138c5d5a80e6949/src/internals.ts#L133-L145
// See https://github.com/vuejs/eslint-config-typescript/blob/e5b983369bee342e3fb0d9141138c5d5a80e6949/src/utilities.ts#L196-L208
config.push({
  files: ['test/cypress/**/*.{js,jsx,ts,tsx}', '**/*.cy.{js,jsx,ts,tsx}'],
  rules: {
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
  }
});

export default config;
