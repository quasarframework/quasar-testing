# @quasar-test

This is the monorepo for integrating the test-runner of your choice into Quasar. For more information and current status, please refer to the following RFC's:

- [\[RFC\] Add --mode test to quasar-cli](https://github.com/quasarframework/quasar-cli/issues/127)
- [\[RFC\] Add test runners to project during quasar init](https://github.com/quasarframework/quasar-starter-kit/issues/43)


### Integration Roadmap
Test runners currently verified to have valid "integration" at the moment are checked off in the following list:

### UNIT
- [x]  [@vue/test-utils](https://vue-test-utils.vuejs.org/en/)
- [x] [ava](https://github.com/avajs/ava)
- [x] [chai](http://www.chaijs.com/)
- [x] [jest23](https://facebook.github.io/jest/)
- [x] [mocha](https://mochajs.org)
- [ ] [mocha-loader](https://github.com/webpack-contrib/mocha-loader) (for webpack) 
- [ ] [mocha-webpack](https://github.com/zinserjan/mocha-webpack)
- [ ] [jasmine](https://jasmine.github.io/)
- [x] [sinon](http://sinonjs.org/)
- [ ] [tap](https://github.com/tapjs/node-tap)
- [ ] [tape](https://github.com/substack/tape)

### E2E
- [ ] [appium](https://github.com/appium/appium) (cordova)
- [x] [cypress](https://github.com/cypress-io/cypress)
- [ ] [karma](https://github.com/karma-runner/karma)
- [ ] [nightwatch](http://nightwatchjs.org/)
- [ ] [spectron](https://github.com/electron/spectron) (electron)

### QUALITY
- [x] [lighthouse 3.0](https://github.com/GoogleChrome/lighthouse)
- [ ] [import-cost](https://github.com/wix/import-cost/tree/master/packages/import-cost)
- [ ] [bundlesize](https://github.com/siddharthkp/bundlesize)


### Contributing
Contributions to this repository are highly desirable. Please fork and PR.
