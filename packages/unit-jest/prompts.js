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
      name: 'babel',
      type: 'list',
      required: true,
      message: 'Please choose how to install required babel rules:',
      choices: [
        // not working at the moment, todo: figure out why
        // {
        //  name: 'Overwrite babel.config.js',
        //  value: 'babelconfig',
        //  default: true
        // },
        {
          name: 'Overwrite babel.config.js and use additional .babelrc',
          value: 'babelrc'
        },
        {
          name: 'Do nothing, I will manage myself',
          value: false
        },
      ]
    },
    {
      name: 'options',
      type: 'checkbox',
      required: true,
      message: 'Jest Unit testing will now be installed. Please choose additional options:',
      choices: [
        {
          name: 'SFC webpack <test> loader',
          value: 'SFC'
        },
        {
          name: 'extra "scripts" in your package.json',
          value: 'scripts'
        }
      ]
    }
  ]
}
