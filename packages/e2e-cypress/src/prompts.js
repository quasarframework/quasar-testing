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
      name: 'options',
      type: 'checkbox',
      required: true,
      message:
        'Cypress e2e Test Harness will now be installed. Please choose additional options:',
      choices: [
        {
          name: 'extra "scripts" in your package.json',
          value: 'scripts',
          checked: true,
        },
        {
          name: 'enable TypeScript support',
          value: 'typescript',
        },
        {
          name: 'setup Cypress for component testing',
          value: 'cct',
          checked: true,
        },
        // Is there a way to make this conditional?
        {
          name: 'add examples for component testing under `src/components`',
          value: 'examples',
          checked: true,
        },
      ],
    },
  ];
};
