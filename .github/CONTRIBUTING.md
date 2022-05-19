# Quasar Contributing Guide

Hi! I’m really excited that you are interested in contributing to Quasar. Before submitting your contribution though, please make sure to take a moment and read through the following guidelines.

- [Code of Conduct](https://github.com/quasarframework/quasar-test/blob/dev/.github/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## Issue Reporting Guidelines

- The issue list of this repo is **exclusively** for bug reports and feature requests. Non-conforming issues will be closed immediately.

  - For simple beginner questions, you can get quick answers from the [Quasar Discord chat room](https://discord.gg/5TDhbDg).

  - For more complicated questions, you can use [the official forum](http://forum.quasar-framework.org/). Make sure to provide enough information when asking your questions - this makes it easier for others to help you!

- Try to search for your issue, it may have already been answered or even fixed in the development branch (`dev`).

- Check if the issue is reproducible with the latest stable version of Quasar. If you are using a pre-release, please indicate the specific version you are using.

- It is **required** that you clearly describe the steps necessary to reproduce the issue you are running into. Although we would love to help our users as much as possible, diagnosing issues without clear reproduction steps is extremely time-consuming and simply not sustainable.

- Use only the minimum amount of code necessary to reproduce the unexpected behavior. A good bug report should isolate specific methods that exhibit unexpected behavior and precisely define how expectations were violated. What did you expect the method or methods to do, and how did the observed behavior differ? The more precisely you isolate the issue, the faster we can investigate.

- Issues with no clear repro steps will not be triaged. If an issue labeled "need repro" receives no further input from the issue author for more than 5 days, it will be closed.

- If your issue is resolved but still open, don’t hesitate to close it. In case you found a solution by yourself, it could be helpful to explain how you fixed it.

- Most importantly, we beg your patience: the team must balance your request against many other responsibilities — fixing other bugs, answering other questions, new features, new documentation, etc. The issue list is not paid support and we cannot make guarantees about how fast your issue can be resolved.

## Pull Request Guidelines

- The `master` branch is basically just a snapshot of the latest stable release. All development should be done in dedicated branches. **Do not submit PRs against the `master` branch.**

- Checkout a topic branch from the relevant branch, e.g. `dev`, and merge back against that branch.

- It's OK to have multiple small commits as you work on the PR - we will let GitHub automatically squash it before merging.

- If you are adding a new test-runner:
- Please make an issue before you make a pull request. Maybe someone else has some good ideas for you or there is previous work that you can adapt.
- Ensure that the test-runner actually works in a real quasar project.
- Write an example test that passes the "baseline.spec.vue" file with deep coverage.
- If you need to make additions to the host package.json, follow the format in the package_template.json

- If adding new feature:

  - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it greenlighted before working on it.

- If fixing a bug:
  - If you are resolving a special issue, add `(fix: #xxxx[,#xxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `fix: update entities encoding/decoding (fix #3899)`.
  - Provide detailed description of the bug in the PR. Live demo preferred.

## Development Setup

As a first step, read the [App Extensions development docs](https://quasar.dev/app-extensions/development-guide/introduction) to get the gist of how the file structure works.

The packages in this repo follow the following naming convention:

- @quasar/app-extension-testing-unit-\*
- @quasar/app-extension-testing-e2e-\*
- @quasar/app-extension-testing-quality

Quasar internally maps extensions (pruning "app-extension-") when running `quasar ext ...` commands, eg. `jest` test-runner App Extension (AE) id would be `@quasar/testing-unit-jest`.

If you would like to help us add official harnesses, please open an issue or get in touch on Quasar Discord server #testing channel.
Avoid opening PRs without getting in touch with us, as we may refuse to merge integrations we cannot commit to maintain.
In these cases, we encourage you to publish and maintain the new integration AE on your own.
We'll try to help you getting started and link your integration on this README :)

---

### Setup

Use the Quasar CLI to create a new Quasar project to test out the changes you'll be doing on testing packages, eg. `quasar create my-example-project`

Fork this monorepo and clone it locally via `git clone https://github.com/<YOUR-GITHUB-HANDLE>/quasar-testing.git`
Move into the monorepo folder (`cd quasar-testing`) and run `yarn install` at root level
Move into the package you're interested into, eg `cd packages/unit-jest`, and start hacking!
When you're ready to test your changes:

- run `yarn build`, if that package has a build step
- run `rm -rf node_modules`, to avoid undebuggable runtime errors due to dependency chain pollution. See https://github.com/yarnpkg/yarn/issues/2822 for more info, remember to rerun `yarn install` when coming back for more changes

Then move to your example project (**it must be OUTSIDE `quasar-testing` folder**):

- install the dependency locally, eg. `yarn add -D <path of testing repo>/packages/unit-jest`
- invoke the AE to trigger the installation process, eg. `quasar ext invoke @quasar/testing-unit-jest`. You can skip this if you didn't change anything into `prompts.js` and `install.js` AE files
- try out the new features you added!

## Project Structure

All folders inside `packages` folder represent a single testing App Extension.
Please check out AEs [introduction](https://quasar.dev/app-extensions/introduction) and [development guide](https://quasar.dev/app-extensions/development-guide/introduction) for minimum knownledge on how to work with them and their folder structure.
All files meant to be scaffolded are stored into a `template` folder inside each AE folder
`test-project` contains a Quasar project with some automatic tests against testing AEs themself. Check out existing specific AE READMEs for additional information
