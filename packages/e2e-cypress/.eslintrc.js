module.exports = {
  overrides: [
    {
      files: ['**/*.cy.{js,jsx,ts,tsx}'],
      extends: [
        // Add Cypress-specific lint rules, globals and Cypress plugin
        // See https://github.com/cypress-io/eslint-plugin-cypress#rules
        'plugin:cypress/recommended',
      ],
    },
  ],
};
