/**
 * Quasar App Extension prompts script
 *
 * Inquirer prompts
 * (answers are available as "api.prompts" in the other scripts)
 * https://www.npmjs.com/package/inquirer#question
 *
 */

module.exports = function () {
  return [
    {
      name: 'harnesses',
      type: 'checkbox',
      required: false,
      message:
        'Please choose which testing harnesses to install:',
      choices: [
        {
          name: 'THIS AE IS DEPRECATED; please refer to individual harnesses AEs instead',
          value: 'deprecation',
          disabled: true
        },
        {
          name: 'See https://github.com/quasarframework/quasar-testing/tree/dev/packages/testing/README.md#DEPRECATION-NOTICE',
          value: 'notice',
          disabled: true
        },
        {
          name: 'Jest Unit Testing (Webpack only, beta)',
          value: 'unit-jest@beta',
        },
        {
          name: 'Vitest Unit Testing (Vite only, alpha)',
          value: 'unit-vitest',
        },
        {
          name: 'Cypress 12 e2e and component testing',
          value: 'e2e-cypress',
        },
      ],
    },
  ];
};
