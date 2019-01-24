module.exports = {
	globals: {
		__DEV__: true
	},
	setupTestFrameworkScriptFile: '<rootDir>/test/jest/jest.setup.js',
	noStackTrace: true,
	bail: true,
	cache: false,
	verbose: true,
	collectCoverage: false,
	coverageDirectory: '<rootDir>/test/jest/coverage',
	collectCoverageFrom: [
		'<rootDir>/src/*.js',
		'<rootDir>/src/*.vue'
	],
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 50,
			lines: 50,
			statements: 50
		}
	},
	testMatch: [
		'<rootDir>/test/jest/__tests__/**/*.spec.js',
		'<rootDir>/test/jest/__tests__/**/*.test.js',
		'<rootDir>/src/**/__tests__/*_jest.spec.js'
	],
	moduleFileExtensions: [
		'js',
		'vue',
    'json'
	],
	moduleNameMapper: {
		'^vue$': '<rootDir>/node_modules/vue/dist/vue.common.js',
		'^quasar$': '<rootDir>/node_modules/quasar-framework/dist/quasar.umd.min.js',
		'^~/(.*)$': '<rootDir>/$1',
		'^src/(.*)$': '<rootDir>/src/$1',
    '.*css$': '<rootDir>/test/jest/utils/stub.css'
  },
	transform: {
		'.*\\.vue$': '<rootDir>/node_modules/vue-jest',
		'.*\\.js$': '<rootDir>/node_modules/babel-jest'
	},
	snapshotSerializers: [
		'<rootDir>/node_modules/jest-serializer-vue'
	]
}
