/**
 * Quasar App Extension prompts script
 *
 * Inquirer prompts
 * (answers are available as "api.prompts" in the other scripts)
 * https://www.npmjs.com/package/inquirer#question
 *
 */

module.exports = function() {
  return [
    {
      name: 'harnesses',
      type: 'checkbox',
      required: false,
      message: 'Please choose which testing harnesses to install:',
      choices: [
        {
          name: 'Jest Unit Testing',
          value: 'unit-jest'
        },
        {
          name: 'AVA Unit Testing',
          value: 'unit-ava'
        },
        {
          name: 'Cypress e2e Testing',
          value: 'e2e-cypress'
        },
        {
          name: 'Webdriver e2e Testing',
          value: 'e2e-webdriver'
        },
        {
          name: 'Quality Testing',
          value: 'quality'
        },
        {
          name: 'Security Testing (OWASP ZAP HUD)',
          value: 'security'
        },
        {
          name: 'Security Anti-Vulnerability',
          value: 'security-antivuln'
        }
      ]
    }
  ]
}
