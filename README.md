<p style="text-align:center">
    <img src="testing_header.png" />
</p>

# **`@quasar/testing`**

This is the monorepo for integrating the test-runner of your choice into your Quasar-Framework app v1.0 and above.

> ### WARNING
>
> This app extension has been updated to work with changes that will be released with `@quasar/app - 1.0.0-beta.9`. If you have not upgraded to at least `1.0.0-beta.9` this app extension will not work.

## High level overview

You can install multiple pre-rigged testing harnesses (test runners) to your existent 1.0+ Quasar application by running a simple command. This command will pull and install a node module (with dependencies) into your project's `package.json`, place necessary configuration files as appropriate and if you so choose, it will also add script commands that expose some of the functionality of the respective harness. You can add multiple harnesses and even use them for your continuous integration pipelines - as appropriate.

Testing is not in and of itself hard. The most complicated part is setting up the testing harness. The trick lies in knowing what to test. If you are new to testing, it is absolutely imperative that you familiarize yourself with some of the concepts and patterns. There are some links for further reading at the end of this document page.

<div class="text-center">
  <div class="h3">REMEMBER</div>
  <div class="h5">Test the functionality, not the function</div>
</div>

## Installing

```shell
$ cd your-quasar-project
$ quasar ext add @quasar/testing
```

This creates a `test` folder to hold all of your test related files and adds several new configuration files to the root folder of your project:

- `quasar.testing.json` => records the commands relevant to respective harnesses
- `quasar.extensions.json` => individual extension options

The lightweight extension installer will ask you which testing harnesses you want to install. Then it will install the respective extensions for these harnesses, which you can configure as you like. It is how multiple testing harnesses are ideally managed within a Quasar project.

It will provide you with a new `quasar test` command that you can use to execute test-runners - and even your HMR dev environment at the same time. This approach can, for example, be quite helpful if you need to pass quasar.ctx to the test runner...

```
# Example to run jest && dev server in pwa mode
$ quasar test --unit jest --dev="-m pwa"
```

If you ever need to review your choices you can take a look at `quasar.extensions.json`.

If you don't want to install the base package, you don't have to do so. You can install each test harness app extension individually. They are completely standalone.

**NOTE: Before 1.0.0-rc.0, the command to run the test is `quasar run @quasar/testing test -- [args for command here]`**

## Updating / Resetting

**Note: All the examples use the unit-jest package. However, the process is the same for [other packages](https://github.com/quasarframework/quasar-testing/tree/dev/packages) as well.**

If you mess up your configuration and need to reset - or just want the latest Quasar-approved packages, this would be the way to do it:

```shell
$ quasar ext add @quasar/testing-unit-jest
```

Be careful though, reinstalling will overwrite ALL existing files (including configurations) if you tell it to. Also, it will install the new packages (if there are any). To prevent installing new or updated node modules, you may do this:

```shell
$ quasar ext invoke @quasar/testing-unit-jest
```

## Removing

If you want to remove the testing harness, you can run:

```shell
$ quasar ext remove @quasar/testing-unit-jest
```

This will remove the associated node module and its dependencies, but it will not delete or modify any files.

## Unit Testing

### [Jest](https://jestjs.io/)

We recommend using Jest 24. There are many, many reasons for this. Just take our word for it.

```shell
$ quasar ext add @quasar/testing-unit-jest
```

We have included:

- a configuration file `jest.config.js`
- `/test/jest/jest.setup.js`
- `.babelrc` file
- a `quasar` scaffolding helper
- a 'validity' test that makes sure quasar is initiatable

> If you are not using git or mercurial to manage your code, jest --watch will not work because jest uses version-control to track which files can be looked at. This leaves you with two options:
>
> 1. run `git init` in your project directory (or permit the installer to do it for you)
> 2. use the alternative `--watchAll` flag for Jest - which will probably have a performance hit - make sure you are ignoring all the folders possible in your Jest configuration.

We have included the optional ability to place your test code inside your vue files, should you choose to do so. It will be rendered by webpack HMR. To run these tests, run `$ quasar test --unit jest --dev`.

```
<test lang="jest">
  /* your complete test file here */
</test>
```

> You may notice that your IDE doesn't know how to parse the test block, so go into the `<test/>` block, press `<alt> + <enter>`, select 'inject language or reference' and select `javascript`. This will grant `<test/>` blocks autocomplete.

#### Options
You can choose to install Wallaby.js to do inline testing. Although it is not freeware, it is an amazing tool and comes highly recommended. https://wallabyjs.com
You can choose to install Majestic, which is a UI interface to see how your tests are doing. https://github.com/Raathigesh/majestic

### [AVA](https://github.com/avajs/ava)

```shell
$ quasar ext add @quasar/testing-unit-ava
```

We have included:

- a configuration file `ava.config.js`
- `/test/ava/setup.js`
- `babel.config.js` file
- a `quasar` scaffolding helper
- a 'validity' test that makes sure quasar is initiatable

We have included the optional ability to place your test code inside your vue files, should you choose to do so. It will be rendered by webpack HMR. To run these tests, run `$ quasar test --unit ava --dev`.

```
<test lang="ava">
  /* your complete test file here */
</test>
```

> You may notice that your IDE doesn't know how to parse the test block, so go into the `<test/>` block, press `<alt> + <enter>`, select 'inject language or reference' and select `javascript`. This will grant `<test/>` blocks autocomplete.

## e2e Testing

We recommend testing webapps with Cypress - but if you are building for multiple platforms (electron, cordova and web), then it's a good idea to use webdriver.io.

### [Cypress](https://www.cypress.io/)

```shell
$ quasar ext add @quasar/testing-e2e-cypress
```

> You must have a running dev server in order to run integration tests. Be sure to either set the `"baseUrl"` in the `/cypress.json` file or use the `test` command provided by the base `@quasar/testing` extension.

We actually recommend installing Cypress globally, because otherwise it is a pretty large package to weigh down the already [heaviest thing in the universe](https://i.redd.it/tfugj4n3l6ez.png).

### [WebDriver.io](https://webdriver.io/) (wdio)

```shell
$ quasar ext add @quasar/testing-e2e-wdio
$ yarn selenium:install && selenium:start
```

**WIP** - please help battle test this harness.
FYI: we're using webdriver 4.0 for the moment because wdio requires it. If you need to use webdriver 5, please get in touch and we can create another app-extension.

Prior Work:
https://github.com/fansanelli/quasar-webdriver/blob
https://github.com/NodeJunkie/quasar-webdriver/tree/feat/BackportToQuasar%231

### Quality Auditing

```shell
$ quasar ext add @quasar/testing-quality
```

Auditing the quality of your app is something you want to do before you go in production. Depending on your perspective, quality can mean many things. So we have put together a few tools that we think can help you have a qualitatively better project.

The `Lighthouse` tool can help you identify issues with your PWA app, but only if you serve the built version of your project. If you use it a lot, consider installing it globally.

`Snyk` is a tool for identifying node modules that have security implications. Running this regularly will keep you alerted to issues that may be stemming from repositories you use.

`Node License Finder (nlf)` is a free tool you can use to catalog all the licenses of the hundreds of open-source projects you are using in your project.

### Security Auditing

Dependency Scanning using [Anti-Vulnerability Scanner](https://github.com/quasarframework/quasar-testing/blob/dev/packages/security-antivuln/README.md)

### Where is `%_my_darling_%` harness?

There will be more and more test-harnesses coming as time permits. If you would like to help us add official harnesses, please get in touch on Discord. Do not merely make a PR, as there are several people working in private forks and it is likely that the harness you are interested in may already be in some stage of development.

## Contents

The packages in this repo are designed to be installed only by the Quasar framework. They follow the following naming convention:

- @quasar/app-extension-testing-unit-\*
- @quasar/app-extension-testing-e2e-\*
- @quasar/app-extension-testing-quality

Because of the way that Quasar internally maps extensions (pruning "app-extension-"), the `ava` test-runner would be `@quasar/testing-unit-ava`.

> Although you could probably install them all with yarn, it is highly recommended to follow the normal approach of using the quasar CLI because of the template files copied over. Furthermore, this will only work with the CLI for Quasar 1.0, not with vue-cli. If you are interested in breaking the warranty, if you were only interested in integrating the node_module dependencies from ava and spectron into your app, technically you could merely run:

```shell
$ yarn add @quasar/quasar-app-extension-testing
$ yarn add @quasar/quasar-app-extension-testing-unit-ava
$ yarn add @quasar/quasar-app-extension-testing-e2e-cypress
```

The test-driven-design approach will also help you to write better (and fewer) tests. Even though it may seem like it slows you down to some degree, this habit of great programmers pays its dividends when other developers accidentally change the interface. Think of tests like insurance for your code that always pays out.

## Development

Clone this repository and run `yarn init`.

Then create a 1.0 Quasar app. Go into the package.json and add this line:

```
    "@quasar/quasar-app-extension-testing-unit-jest": "link:../%path_to_quasar-testing%/packages/unit-%_your-harness_%",
```

Then run `yarn` and finally:

```shell
$ quasar ext invoke @quasar/testing-unit-%_your-harness_%
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
- [x] [webdriver.io](http://webdriver.io/) (wdio - multi tenant)

### QUALITY

- [x] [lighthouse 3.0](https://github.com/GoogleChrome/lighthouse)
- [x] [snyk](https://snyk.io/test)
- [x] [nlf](https://github.com/iandotkelly/nlf) (Node license finder)
- [ ] [import-cost](https://github.com/wix/import-cost/tree/master/packages/import-cost) (custom)
- [ ] [bundlesize](https://github.com/siddharthkp/bundlesize) (custom)
- [ ] [webpagetest](https://www.webpagetest.org/)

### UTILS

- [ ] [jest-codemods](https://www.npmjs.com/package/jest-codemods)
- [ ] [ava-codemods](https://github.com/avajs/ava-codemods) (tape=>ava)

## Further Reading

### Books

- [Testing Vue.js Applications](https://www.manning.com/books/testing-vue-js-applications) by Edd Yerburgh, the author of the `@vue/test-utils` repo
- [Free Vue Testing Handbook](https://lmiller1990.github.io/vue-testing-handbook/)

### Tutorials

- [Unit Testing Vue Router with Jest](https://medium.com/js-dojo/unit-testing-vue-router-1d091241312)
- ... add your suggestions here

### Documentation

- [@vue/test-utils](https://vue-test-utils.vuejs.org)
- [jest 24](https://facebook.github.io/jest/)
- [cypress](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html#Cypress-Is-Simple)
- [lighthouse](https://developers.google.com/web/tools/lighthouse/#cli)
- [snyk](https://snyk.io/test)
- [nlf](https://www.npmjs.com/package/nlf)
- [chai](http://www.chaijs.com/)
- [istanbul](https://istanbul.js.org/)

## Contributing

Contributions to this repository are highly desirable. Before you make a PR, please open an issue, create a fork and PR. See the [Contribution Guidelines](./.github/CONTRIBUTING.md) for more details. Please note: Project coordination takes place on the [Discord server](https://discord.gg/5TDhbDg).

## Contributors

- [nothingismagick](https://github.com/nothingismagick)
- [nklayman](https://github.com/nklayman)
- [Allan Gaunt](https://github.com/webnoob)
- [andreiTn](https://github.com/andreiTn)
- [fansanelli](https://github.com/fansanelli)
- mgibson91
- eugene
- bloo_df
- PhearZero

## Special Thanks

Denjell would like to give a special shout out to all of the people who helped test the testing framework during the transition from 0.17 to 1.0

## License

MIT ©2018 - present - D.C. Thompson & Razvan Stoenescu

All Icons © the respective owners
