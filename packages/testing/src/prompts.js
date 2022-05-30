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
          name: 'Jest Unit Testing',
          value: 'unit-jest@alpha',
        },
        {
          name: 'Cypress e2e Testing',
          value: 'e2e-cypress',
        },
      ],
    },
  ];
};
