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
        'Please choose which testing harnesses to install (only Qv2-compatible harnesses are shown):',
      choices: [
        {
          name: 'Jest Unit Testing (Webpack only, beta)',
          value: 'unit-jest@beta',
        },
        {
          name: 'Vitest Unit Testing (Vite only, alpha)',
          value: 'unit-vitest@alpha',
        },
        {
          name: 'Cypress 9 e2e and component testing',
          value: 'e2e-cypress',
        },
        {
          name: 'Cypress 10 e2e and component testing (beta)',
          value: 'e2e-cypress@beta',
        },
      ],
    },
  ];
};
