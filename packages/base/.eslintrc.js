module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
    'cypress/globals': true,
  },
  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: ['plugin:vue/essential', 'airbnb-base'],
  // required to lint *.vue files
  plugins: [
    'vue',
    'cypress'
  ],
  globals: {
    'ga': true, // Google Analytics
    'cordova': true,
    '__statics': true
  },
  // add your custom rules here
  'rules': {
    'indent': 'off',
    'max-len': 'off',
    'vue/script-indent': ['error', 2, { 'baseIndent': 1, 'switchCase': 1 }],
    'no-console': 'off',
    'no-param-reassign': 0,
    'import/first': 0,
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,

    // allow debugger during development
    //  'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
    // Warn while in development, but error in production
    'no-debugger': warnInDevErrorInProd(),
    'no-unused-vars': warnInDevErrorInProd(),
    'no-multiple-empty-lines': warnInDevErrorInProd(),
    'comma-dangle': warnInDevErrorInProd()
  }
}

/**
 * Checks the environment and sets 'warn' for development and 'error' for prod.
 */

function warnInDevErrorInProd() {
  return process.env.NODE_ENV === 'production' ? 'error' : 'warn'
}
