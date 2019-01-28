title: Configuration
---

If you mess up your configuration, things will break and the sky will fall. This page maintains a few "sane" configuration recipes and config sources that will help you keep your rig from blowing up. 

Here are some quick links to save you time:
- [mocha-webpack](http://zinserjan.github.io/mocha-webpack/docs/installation/cli-usage.html)
- [nyc]()
- [TestCafé](https://github.com/DevExpress/testcafe)


## Test hook and initialization
> `/test/setup.js`

#### Global setups
Globals are the way that test-runners have access to the test dialect across your suite of tests. If you want to add a new test dialect, this is the place.

```js
require('jsdom-global')() // otherwise the system breaks
global.expect = require('chai').expect
global.sinon = require('sinon')
global.jest = require('jest')
```

## Webpack
> `/test/webpack.test.js`


#### Aliases
Aliases help import to always resolve where you want it to go, regardless of CWD. 
```
  resolve: {
    alias: {
      src: path.resolve(__dirname, '/src'),
      components: path.resolve(__dirname, '/src/components'),
      layouts: path.resolve(__dirname, '/src/layouts'),
      pages: path.resolve(__dirname, '/src/pages'),
      assets: path.resolve(__dirname, '/src/assets'),
      variables: path.resolve(__dirname, '/.quasar/variables.styl'),
      '@quasar': 'quasar-framework/dist/quasar.mat.esm.js', // is this right? seems hacky
      '@src': path.resolve(__dirname, './src'),
    }
  }
```

#### File-types to be tested
This is where you can make sure that your file types are actually hit by the test-runner.
```
module: {
    rules: [
      {
        test: '/spec\.js',
        use: 'mocha-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$|\.vue$|\.ts$/,
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: {
            esModules: true,
            produceSourceMap: true,
            fixWebpackSourcePaths: true
          }
        },
        enforce: 'post',
        exclude: /node_modules|\.spec\.js$/,
      }
    ]
    }
```
## Mocha
> `/test/mocha.opts`

``` 

```

## Mocha-Webpack
> `/mocha-webpack.opts`
> very soon will move to /test/mocha-webpack.opts

These options define how webpack works with mocha. There are a lot more options, but these are sane.
 
``` 
--colors
--webpack-config test/webpack.test.js
--require test/setup.js
--check-leaks
test/**/*.spec.js
```

## Istanbul/NYC
> `/.nycrc`

All command line options of NYC can be added to the config file. Note: lines, functions and branches here refer to the high (and if you like low) water-mark for the respective coverage.

```json
{
  "check-coverage": true,
  "all": true,
  "lines": 95,
  "functions": 95,
  "branches": 95,
  "reporter": [
    "lcov",
    "text",
    "text-summary"
  ],
  "instrument": false,
  "sourceMap": false,
  "require": [
    "./test/setup.js"
  ],
  "temp-dir": "./test/coverage/nyc_output",
  "report-dir": "./test/coverage/nyc_tmp"
}
```

## Cypress

> `/cypress.json`

```json
{
  "baseUrl": null,
  "env": {},
  "ignoreTestFiles": {},
  "watchForFileChanges": true,
  "screenshotOnHeadlessFailure": true,
  "fileServerFolder": "./src",
  "fixturesFolder": "./test/cypress/fixtures",
  "integrationFolder": "./test/cypress/integrations",
  "pluginsFile": "./test/cypress/plugins/index.js",
  "screenshotsFolder": "./test/cypress/screenshots",
  "supportFile": false,
  "videosFolder": "./test/cypress/videos",
  "chromeWebSecurity": true
}
```

## Lighthouse

Lighthouse is really complicated to configure if you are running it from the command line, but a bit less so if you are running it in a node wrapper. Check out the `/test/quality/configs` folder for some ideas.
