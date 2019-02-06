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
      message: 'Lighthouse, snyk and nlf will be installed. Please choose the following options:',
      choices: [
        {
          name: 'extra "scripts" in your package.json',
          value: 'scripts'
        }
      ]
    }
  ]
}
