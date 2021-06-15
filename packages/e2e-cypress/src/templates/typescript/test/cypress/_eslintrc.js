module.exports = {
  // ESLint "parserOptions" options should be overrided to point to the same tsconfig used
  //  by fork-ts-checker (check the app extension "index.js") or type errors won't be emitted (only linting ones will)
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },

  extends: [
    // Add Cypress-specific lint rules, globals and Cypress plugin
    // See https://github.com/cypress-io/eslint-plugin-cypress#rules
    'plugin:cypress/recommended'
  ]
};
