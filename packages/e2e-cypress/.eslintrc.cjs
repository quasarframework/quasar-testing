module.exports = {
  overrides: [
    {
      files: ['**/test/cypress/**/*.{js,jsx,ts,tsx}', '**/*.cy.{js,jsx,ts,tsx}'],
      extends: [
        // Add Cypress-specific lint rules, globals and Cypress plugin
        // See https://github.com/cypress-io/eslint-plugin-cypress#rules
        'plugin:cypress/recommended',
      ],
    },
  ],
};
