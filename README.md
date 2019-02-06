<p style="text-align:center">
    <img src="testing_header.png" />
</p>

# **`@quasar/testing`**
This is the monorepo for integrating the test-runner of your choice into your Quasar-Framework app v1.0 and above. 

## High level overview

You can install multiple pre-rigged testing harnesses to your existent 1.0+ Quasar application by running a simple command. This command will pull and install a node module (with dependencies) into your project's `package.json`, place necessary configuration files as appropriate and if you so choose, it will also add script commands that expose some of the functionality of the respective harness. You can add multiple harnesses and even use them for your continuous integration pipelines - as appropriate.

Testing is not in and of itself hard. The most complicated part is setting up the testing harness. The trick lies in knowing what to test. If you are new to testing, it is absolutely imperative that you familiarize yourself with some of the concepts and patterns. There are some links for further reading at the end of this document page.

<div class="text-center">
  <div class="h3">REMEMBER</div>
  <div class="h5">Test the functionality, not the function</div>
</div>


## Installation
There are two methods of installing the test runner(s) of your choice:
- [ ] During the `quasar create` phase of making a new app.
- [x] By adding an extension with `quasar ext`

```shell
$ cd your-quasar-project
$ quasar ext --add @quasar/testing
```

The lightweight extension installer will ask you which testing harnesses you want to install. Then it will install the respective extensions for these harnesses, which you can configure as you like. It is how multiple testing harnesses are ideally managed within a Quasar project.

It will provide you with a new `quasar run` command that you can use to execute test-runners - and even your HMR dev environment at the same time. This approach can, for example, be quite helpful if you need to pass quasar.ctx to the test runner...

```
# Example to run jest --watch && dev server
$ quasar run @quasar/testing test --unit=jest.watch.coverage --dev=pwa
```

If you ever need to review your choices you can take a look at `quasar.extensions.json`.

If you don't want to install the base package, you don't have to do so. You can install each test harness app extension individually. They are completely standalone.

### Updating / Resetting

If you mess up your configuration and need to reset - or just want the latest Quasar-approved packages, this would be the way to do it:
```shell
$ quasar ext --add @quasar/testing-unit-jest
```
Be careful though, reinstalling will overwrite ALL existing files (including configurations) if you tell it to. Also, it will install the new packages (if there are any). To prevent installing new or updated node modules, you may do this:

```shell
$ quasar ext --add @quasar/testing-e2e-cypress --skip-pkg
```

### Removing

If you want to remove the testing harness, you can run:
```shell
$ quasar ext --remove @quasar/testing-unit-jest
```
This will remove the associated node module and its dependencies, but it will not delete or modify any files.


## Contents
The packages in this repo are designed to be installed only by the Quasar framework. They follow the following naming convention: 

 - @quasar/app-extension-testing-unit-* 
 - @quasar/app-extension-testing-e2e-* 
 - @quasar/app-extension-testing-quality

Because of the way that Quasar internally maps extensions (pruning "app-extension-"), the `ava` test-runner would be `@quasar/test-unit-ava`. 


> Although you could probably install them all with yarn, it is highly recommended to follow the normal approach of using the quasar CLI because of the template files you copy over. Furthermore, this will only work with the CLI for Quasar 1.0, not with vue-cli. If you are interested in breaking the warranty, if you were only interested in integrating the node_module dependencies from ava and spectron into your app, technically you could merely run: 

```bash
$ yarn add @quasar/test-testing 
$ yarn add @quasar/test-unit-ava
$ yarn add @quasar/test-e2e-spectron
```

The test-driven-design approach will also help you to write better (and fewer) tests. Even though it may seem like it slows you down to some degree, this habit of great programmers pays its dividends when other developers accidentally change the interface. Think of tests like insurance for your code that always pays out.


## Development 
Clone this repository and run `yarn init`.

Then create a 1.0 Quasar app. Go into the package.json and add this line:
``` 
    "@quasar/quasar-app-extension-testing-unit-jest": "link:../%path_to_quasar-testing%/packages/unit-%_your-harness_%",
```

Then run `yarn` and finally:

```bash
$ quasar ext --add @quasar/testing-unit-%_your-harness_% --skip-pkg
```

Please consult the forthcoming documentation about how to create app extensions at the main Quasar docs - or learn by copying.

## Integration Roadmap
Test harnesses currently verified to have valid "integration" are checked off in the following list:

### UNIT
- [x] [ava](https://github.com/avajs/ava)
- [ ] [jasmine 3](https://jasmine.github.io/)
- [x] [jest 24](https://facebook.github.io/jest/)
- [ ] [tap](https://github.com/tapjs/node-tap)
- [ ] [tape](https://github.com/substack/tape)
- [x] [mocha](https://mochajs.org)
- [ ] [mocha-loader](https://github.com/webpack-contrib/mocha-loader) (for webpack) 
- [ ] [mocha-webpack](https://github.com/zinserjan/mocha-webpack)

### E2E
- [ ] [appium](https://github.com/appium/appium) (cordova)
- [x] [cypress](https://github.com/cypress-io/cypress)
- [ ] [karma](https://github.com/karma-runner/karma)
- [ ] [nightwatch](http://nightwatchjs.org/)
- [ ] [polly.js](https://github.com/Netflix/pollyjs)
- [ ] [spectron](https://github.com/electron/spectron) (electron)
- [ ] [testcafe](https://github.com/DevExpress/testcafe)
- [ ] [testee](https://github.com/bitovi/testee)

### QUALITY
- [x] [lighthouse 3.0](https://github.com/GoogleChrome/lighthouse)
- [x] [snyk](https://snyk.io/test)
- [ ] [import-cost](https://github.com/wix/import-cost/tree/master/packages/import-cost) (custom)
- [ ] [bundlesize](https://github.com/siddharthkp/bundlesize) (custom)
- [ ] https://www.webpagetest.org/

### UTILS
- [ ] [jest-codemods](https://www.npmjs.com/package/jest-codemods)
- [ ] [ava-codemods](https://github.com/avajs/ava-codemods) (tape=>ava)


## Contributing
Contributions to this repository are highly desirable. Before you make a PR, please open an issue, create a fork and PR. See the [Contribution Guidelines](./.github/CONTRIBUTING.md) for more details. Please note: Project coordination takes place on the [Discord server](https://discord.gg/5TDhbDg). 

## Contributors
- [nklayman](https://github.com/nklayman)
- [andreiTn](https://github.com/andreiTn)
- mgibson91
- eugene
- bloo_df
- PhearZero

## License
MIT ©2018 - present - D.C. Thompson & Razvan Stoenescu

All Icons © the respective owners
