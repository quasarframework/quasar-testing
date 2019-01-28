module.exports = {
	presets: [
		'@quasar/babel-preset-app',
		"@babel/preset-env",
			{
				"modules": "commonjs",
				"targets": {
					"node": "current"
				}
			}
	]
}
