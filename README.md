<p style="text-align:center">
    <img src="testing_header.png" />
</p>

# **`@quasar/testing`**

This is the monorepo for integrating the test-runner of your choice into your Quasar app.

You can install multiple pre-rigged testing harnesses (test runners) to your Quasar application, each one will:

- install the harness NPM package into your project;
- scaffold necessary configuration files;
- add script commands which expose some functionality of the respective harness.

> App Extensions (such as these testing harnesses) only work with Quasar CLI, not with Vue CLI, nor by directly installing packages via a package manager as npm or yarn. Use `quasar ext add ...` or the installation step won't be executed and configuration files won't be copied over.

Testing is not in and of itself hard. The most complicated part is setting up the testing harness. The trick lies in knowing what to test. If you are new to testing, it is absolutely imperative that you familiarize yourself with some of the concepts and patterns. There are some links for further reading at the end of this document page.

The Test Driven Design approach will help you to write better (and fewer) tests. Even though it may seem like it slows you down to some degree, this habit pays its dividends on the long term drastically reducing the number of public bugs and the project maintenance effort. Think of tests like insurance for your code that always pays out. On the other hand, not everything is worth being tested, or is worth being tested only at an higher level (eg. using an E2E tests instead of unit tests).

<div class="text-center">
  <div class="h3">REMEMBER</div>
  <div class="h5">Test the functionality, not the function</div>
</div>

## Table of contents

- [Donations](#donations)
- [Installation](#installation)
- [Removal](#removal)
- [Reset](#reset)
- [Upgrade](#upgrade)
- Provided App Extensions

  - [Testing Harnesses Manager](packages/testing/README.md) (**DEPRECATED**)
  - Unit testing

    - [Jest](packages/unit-jest/README.md)
    - [Vitest](packages/unit-vitest/README.md)

  - E2E testing
    - [Cypress](packages/e2e-cypress/README.md)
  - [Quality Auditing](#quality-auditing) (**OUTDATED, not migrated to Qv2 yet**)

- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Donations

The Quasar team spend a considerable amount of time studying, coding and maintaining App Extensions (AE) which save literally thousands of developers hours, days or weeks of work.

Does your business or personal projects depend on these App Extensions? How much time did we save you until now? Consider [donating](https://github.com/sponsors/rstoenescu) to help us maintain them and allow us to create new ones!

## Installation

You can add test harnesses:

- in a centralized way via the [Testing Harnesses Manager](packages/testing/README.md) (**DEPRECATED**);
- using an "a-la-carte" approach, checking each harness documentation.

You can add multiple harnesses and even use them into your continuous integration pipelines.

## Removal

You can remove a testing harness running:

```shell
$ quasar ext remove @quasar/testing-unit-jest
```

This will remove the associated NPM package and run the Quasar App Extensions uninstall hook.
If not done into the AE uninstall hook, the removal won't delete test or configuration files.

## Reset

If you mess up your configuration and need to reset, or just want to check out if there has been any changes into new versions configuration, you should run:

```shell
$ quasar ext add @quasar/testing-unit-jest
```

Be careful though, this will overwrite ALL existing files (including configurations) if you allow it to. Make sure to have some kind of version control in place before proceeding. This operation will also upgrade the NPM package and its dependencies.

To prevent installing new or updated dependencies, you should run:

```shell
$ quasar ext invoke @quasar/testing-unit-jest
```

## Upgrade

You can upgrade a testing harness and its dependencies by updating its related NPM package.

```
$ yarn add -D @quasar/quasar-app-extension-testing-unit-jest
```

This won't change existing test or configuration files.

### Upgrade to a new major version with NPM

When upgrading between major versions, since there are major changes, we suggest you to remove and re-add the AE, to obtain lastest configuration files too.
Ensure your source control is clean before proceeding, then answer (y) and "Overwrite all" when prompted to overwrite existing files and individually `git diff` all changes manually to check out which changes you want to keep and which you want to revert.

```shell
$ quasar ext remove @quasar/testing-unit-jest
$ quasar ext add @quasar/testing-unit-jest
```

## Testing Harnesses Manager (**DEPRECATED**)

[Check out Testing Harnesses Manager AE documentation](packages/testing/README.md)

## Unit Testing

### [Jest](https://jestjs.io/)

[Check out Jest AE documentation](packages/unit-jest/README.md)

### [Vitest](https://vitest.dev/)

[Check out Vitest AE documentation](packages/unit-vitest/README.md)

## E2E Testing

We recommend testing webapps with Cypress if you target Chrome-based browsers (Chrome, Edge, Electron) or Firefox - but if you want to test Safari or Cordova/Capacitor apps, then you should consider using webdriver.io.

### [Cypress](https://www.cypress.io/)

[Check out Cypress AE documentation](packages/e2e-cypress/README.md)

### Quality Auditing (**OUTDATED, not migrated to Qv2 yet**)

```shell
$ quasar ext add @quasar/testing-quality
```

Auditing the quality of your app is something you want to do before you go in production. Depending on your perspective, quality can mean many things. So we have put together a few tools that we think can help you have a qualitatively better project.

The `Lighthouse` tool can help you identify issues with your PWA app, but only if you serve the built version of your project. If you use it a lot, consider installing it globally.

`Snyk` is a tool for identifying node modules that have security implications. Running this regularly will keep you alerted to issues that may be stemming from repositories you use.

`Node License Finder (nlf)` is a free tool you can use to catalog all the licenses of the hundreds of open-source projects you are using in your project.

## Further Reading

### Books

- [Testing Vue.js Applications](https://www.manning.com/books/testing-vue-js-applications) by Edd Yerburgh, the author of the `@vue/test-utils` repo
- [Free Vue Testing Handbook](https://lmiller1990.github.io/vue-testing-handbook/)

### Tutorials

- [Introduction to TDD](https://www.computer.org/csdl/magazine/so/2007/03/s3024/13rRUygT7kK)
- [Overview of JavaScript testing 2020](https://medium.com/welldone-software/an-overview-of-javascript-testing-7ce7298b9870)
- [Unit Testing Vue Router with Jest](https://medium.com/js-dojo/unit-testing-vue-router-1d091241312)
- [Jest tests debugging](https://artsy.github.io/blog/2018/08/24/How-to-debug-jest-tests/)

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

Contributions to this repository are highly desirable, see the [Contribution Guidelines](./.github/CONTRIBUTING.md) for more details.
Please note: project coordination takes place on the [Discord server](https://discord.gg/5TDhbDg).

## Contributors

- [ilcallo](https://github.com/ilcallo)
- [nothingismagick](https://github.com/nothingismagick)
- [nklayman](https://github.com/nklayman)
- [Allan Gaunt](https://github.com/webnoob)
- [andreiTn](https://github.com/andreiTn)
- [fansanelli](https://github.com/fansanelli)
- mgibson91
- eugene
- bloo_df
- PhearZero

## License

MIT ©2022 - present - Paolo Caleffi & Razvan Stoenescu

All Icons © the respective owners
