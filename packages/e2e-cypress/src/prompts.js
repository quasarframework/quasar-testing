/**
 * Quasar App Extension prompts script
 *
 * Inquirer prompts
 * (answers are available as "api.prompts" in the other scripts)
 * https://www.npmjs.com/package/inquirer#question
 *
 */

module.exports = function (api) {
  return [
    {
      name: 'options',
      type: 'checkbox',
      required: true,
      message:
        'Cypress e2e and component Test Harness will now be installed. Please choose additional options:',
      choices: [
        {
          name: 'enable code coverage (currently only supported using Vite, not Webpack)',
          value: 'code-coverage',
          checked: api.hasVite,
        },
      ],
    },
  ];
};
