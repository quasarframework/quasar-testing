/**
 * Quasar App Extension prompts script
 *
 * Inquirer prompts
 * (answers are available as "api.prompts" in the other scripts)
 * https://www.npmjs.com/package/inquirer#question
 *
 */

const { enforcedDevServerPort } = require('./shared');

module.exports = function (api) {
  return [
    {
      name: 'port',
      type: 'text',
      required: true,
      default: enforcedDevServerPort,
      message: 'Choose which port the app will be served when run for Cypress:',
    },
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
