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
        'Jest Unit testing will now be installed. Please choose additional options:',
      choices: [
        {
          name: 'Extra "scripts" in your package.json',
          value: 'scripts',
          checked: true,
        },
        {
          name: 'TypeScript support',
          value: 'typescript',
        },
        {
          name: 'SWC for TypeScript (experimental)',
          value: 'swc',
        },
        {
          name: 'Use Majestic UI as Jest tests GUI',
          value: 'majestic',
        },
      ],
    },
  ];
};
