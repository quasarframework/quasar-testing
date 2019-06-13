module.exports = function () {
	return [
		{
			name: 'options',
			type: 'checkbox',
			required: true,
			message: 'Please choose the following options to configure security-antivuln:',
			choices: [
				{
					name: 'Scan when running `quasar dev`?',
					value: 'runOnDev'
				},
				{
					name: 'Scan when running `quasar build`?',
					value: 'runOnBuild'
				},
				{
					name: 'Strict mode? (If vulnerabilities are found, script execution will stop when runOnDev and / or runOnBuild are true)',
					value: 'strict'
				}
			]
		}
	]
}
