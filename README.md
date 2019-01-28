<p style="text-align:center">
    <img src="testing_header.png" />
</p>

# **`@quasar/testing`** - *Work in Progress*
This is the monorepo for integrating the test-runner of your choice into your Quasar-Framework app v1.0 and above. 


## Installation
There are two methods of installing the test runner(s) of your choice:
- [ ] During the `quasar create` phase of making a new app.
- [x] By adding an extension with `quasar ext`

## TEMPORARY INSTRUCTIONS:

First, clone and fork this repo. Then create a 1.0 Quasar app. Go into the package.json and add this line:
``` 
    "@quasar/quasar-app-extension-testing-unit-jest": "link:../%path_to_quasar-testing%/packages/unit-jest",
```
Then run `yarn` and finally:

```bash
$  quasar ext --add @quasar/testing-unit-jest --skip-pkg
```

Accept the babel override and both options (`<SFC>` and test scripts).

When it completes, run `yarn test:jest`.

## Contents
The packages in this repo are designed to be installed only by the Quasar framework. They follow the following naming convention: 

 - @quasar/app-extension-testing-unit-* 
 - @quasar/app-extension-testing-e2e-* 
 - @quasar/app-extension-testing-quality

Where for example the `ava` test-runner would be `@quasar/test-unit-ava`. 



> Although you could probably install them all with yarn, it is highly recommended to follow the normal approach of using the quasar CLI.  If you are interested in breaking the warranty, if you were only interested in integrating ava and spectron into your app, technically you could merely run: 

```bash
$ yarn add @quasar/test-base 
$ yarn add @quasar/test-unit-ava
$ yarn add @quasar/test-e2e-spectron
```

## Development 
Clone this repository and run `yarn init`.


## Integration Roadmap
Test harnesses currently verified to have valid "integration" are checked off in the following list:

### BASE
- [x] [@vue/test-utils](https://vue-test-utils.vuejs.org)
- [x] [@vue/test-server-utils](https://github.com/vuejs/vue-test-utils/tree/dev/packages/server-test-utils)
- [x] [chai](http://www.chaijs.com/)
- [x] [expect](https://js.libhunt.com/expect-js-alternatives)
- [x] [istanbul](https://istanbul.js.org/)
- [x] [jsdom](https://github.com/jsdom/jsdom)
- [x] [nyc](https://github.com/istanbuljs/nyc)
- [x] [sinon](http://sinonjs.org/)

### UNIT
- [x] [ava](https://github.com/avajs/ava)
- [ ] [jasmine 3](https://jasmine.github.io/)
- [x] [jest 23](https://facebook.github.io/jest/)
- [ ] <strike>[QUnit](http://qunitjs.com/) (jquery based)</strike>
- [ ] [tap](https://github.com/tapjs/node-tap)
- [ ] [tape](https://github.com/substack/tape)
- [x] [mocha](https://mochajs.org)
- [ ] [mocha-loader](https://github.com/webpack-contrib/mocha-loader) (for webpack) 
- [ ] [mocha-webpack](https://github.com/zinserjan/mocha-webpack)

### E2E
- [ ] [appium](https://github.com/appium/appium) (cordova)
- [x] [cypress](https://github.com/cypress-io/cypress)
- [ ] <strike>[funcunit](https://github.com/bitovi/funcunit) (jquery based)</strike>
- [ ] [karma](https://github.com/karma-runner/karma)
- [ ] [nightwatch](http://nightwatchjs.org/)
- [ ] [polly.js](https://github.com/Netflix/pollyjs)
- [ ] [spectron](https://github.com/electron/spectron) (electron)
- [ ] [testcafe](https://github.com/DevExpress/testcafe)
- [ ] [testee](https://github.com/bitovi/testee)

### QUALITY
- [x] [lighthouse 3.0](https://github.com/GoogleChrome/lighthouse)
- [ ] [import-cost](https://github.com/wix/import-cost/tree/master/packages/import-cost) (custom)
- [ ] [bundlesize](https://github.com/siddharthkp/bundlesize) (custom)
- [ ] https://www.webpagetest.org/

### UTILS
- [ ] [snyk](https://snyk.io/test)
- [ ] [jest-codemods](https://www.npmjs.com/package/jest-codemods)
- [ ] [ava-codemods](https://github.com/avajs/ava-codemods) (tape=>ava)


## Contributing
Contributions to this repository are highly desirable. Before you make a PR, please open an issue, create a fork and PR. See the [Contribution Guidelines](./.github/CONTRIBUTING.md) for more details. Please note: Project coordination takes place on the [Discord server](https://discord.gg/5TDhbDg). 

## Contributors
- [andreiTn](https://github.com/andreiTn)
- mgibson91
- eugene
- bloo_df

## License
MIT ©2018 - D.C. Thompson & Razvan Stoenescu

All Icons © the respective owners
