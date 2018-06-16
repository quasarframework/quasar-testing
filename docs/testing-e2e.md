title: e2e
---
 CYPRESS VERSION:
<a href="https://github.com/cypress-io">
    <img alt="Tested with Cypress" src="https://img.shields.io/badge/tested with-Cypress-2fa4cf.svg">
</a>

Although vue-cli offers to bundle nightwatch into a new project, we have decided to use Cypress instead, because of the way that it [plays nicely](https://docs.cypress.io/guides/references/bundled-tools.html) with mocha, chai and sinon. Instead of learning and using a completely different grammar for your tests (like in Nightwatch and TestCafé), you can leverage the types of tests that you know in a structured way and even extend chai, for example, with [sinon stubs](https://github.com/cypress-io/sinon-chai) - which we already took care of for you.

There are two main approaches to using Cypress. If you wish to have it installed globally, `quasar mode --add test` will detect this and not install it locally in your projects node_modules folder. This has the benefit of a somewhat faster install time for adding all of the test repositories, and you will have one interface to work with all of your projects on your development machine. When you start this testing mode for the first time, however, you will have to map the folder again. 
 
### TIP
> Install cypress globally. This will speed up your build time if you work with many different projects, and the install mode will detect if you have it installed already and use that version.

https://docs.cypress.io/guides/references/best-practices.html
This [monorepo](https://github.com/cypress-io/cypress-example-recipes) from cypress-io is a great place to look for inspiration when you need discover a way to test for example [Vue + Vuex + REST](https://github.com/cypress-io/cypress-example-recipes#vue--vuex--rest-testing).

### this looks promising, but does not seem compatible with quasar16
https://github.com/bahmutov/cypress-vue-unit-test


## Cypress Settings
https://docs.cypress.io/guides/references/configuration.html

## Setting up the Test Runner
First, you will need an account at https://dashboard.cypress.io 

## Sinon-Chai

## Sinon-Chai assertions in cypress


