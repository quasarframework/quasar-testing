module.exports = function () {
  return [
    {
      name: 'options',
      type: 'checkbox',
      required: true,
      message: 'Please choose the following options:',
      choices: [
        {
		      name: 'install the OWASP ZAP Heads Up Display',
		      value: 'zap_local',
        },
        {
          name: 'use your Global ZAP (not yet available)',
          value: 'zap_global',
        }
      ]
    }
  ]
}
