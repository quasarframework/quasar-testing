module.exports = wallaby => {
  const path = require('path')
  process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true
  process.env.QUASAR_APP_TEST = true

  const compiler = wallaby.compilers.babel({
    presets: [['@quasar/app', { presetEnv: { modules: 'commonjs' } }]],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            quasar: path.join(
              wallaby.projectCacheDir,
              'node_modules/quasar/dist/quasar.umd.js'
            ),
            'test-utils': path.join(
              wallaby.projectCacheDir,
              'node_modules/@vue/test-utils'
            ),
            '~': path.join(wallaby.projectCacheDir, './')
          }
        }
      ]
    ]
  })

  return {
    files: [
      'src/**/*',
      'ava.config.js',
      'package.json',
      'test/**/*',
      '!test/**/*.spec.js',
      '!src/**/*.spec.js'
    ],

    tests: ['src/**/*_spec.js', 'test/ava/**/*.spec.js'],

    env: {
      type: 'node',
      runner: 'node'
    },

    compilers: {
      '**/*.js': compiler,
      '**/*.vue': require('wallaby-vue-compiler')(compiler)
    },

    preprocessors: {
      '**/*.vue': file => require('vue-jest').process(file.content, file.path)
    },
    setup: () => {
      require('jsdom-global')(undefined, {
        url: 'http://localhost'
      })
      // https://github.com/vuejs/vue-cli/issues/2128
      window.Date = Date
      // https://github.com/vuejs/vue/issues/9698
      global.performance = window.performance
    },
    testFramework: 'ava',
    debug: true
  }
}
