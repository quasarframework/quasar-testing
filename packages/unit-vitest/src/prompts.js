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
        'Vitest Unit testing will now be installed. Please choose additional options:',
      choices: [
        {
          name: 'Extra "scripts" in your package.json',
          value: 'scripts',
          checked: true,
        },
        {
          name: 'Use Typescript',
          value: 'typescript',
        },
        {
          name: 'Install Vitest UI',
          value: 'ui',
        },
      ],
    },
  ];
};
