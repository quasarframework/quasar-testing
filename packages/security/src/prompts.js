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
    },
    {
      name: 'zapbrowser',
      type: 'list',
      required: true,
      message: 'Please choose the browser to launch for ZAP testing:',
      choices: [
        {
          name: 'Firefox',
          value: 'Firefox'
        },
        {
          name: 'Chrome',
          value: 'Chrome'
        }
      ],
      default: 'Firefox'
    }
  ]
}
