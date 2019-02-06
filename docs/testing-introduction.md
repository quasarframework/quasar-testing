title: Introduction to Testing
---

Testing is a method of verifying that code does what it is supposed to do - before it is deployed. In a sense it is like "pre-debugging"; in that you define what you expect your code to do through specifications and then write code to fulfil these expectations. Code-units that do not pass these tests are considered "failing".

Tests provide you with a method to audit your codebase and allow development teams to have explicit agreement upon what the code **must** do. Continuous Integration (CI) systems use tests to make sure that the code still exhibits expected behaviour after changes have been made to the code - and most importantly makes sure that the parts work together as expected. In fact, code not passing tests is the most common cause of failed pull-requests. Making sure that you follow the best practice pattern of keeping new versions of your code compliant with the specs that you have written is one step toward enlightenment through test writing. ;)

You may be used to running `yarn test` to run your tests, but we have extended the `quasar-cli` and the framework to integrate testing as a first-class citizen of the Quasar Framework environment for your development pleasure.

There are four kinds of tests that this mode will enable you to run:
- Unit tests (Make sure your "code-units" work atomically) `quasar test -u`
- E2E testing (Guarantee that units work together in the "real" world) `quasar test -e`
- Quality testing (Get yourself some quality metrics with lighthouse) `quasar test -q`


To quickly familiarize yourself with testing in general and common pitfalls of vue-testing in particular, we recommend that you check out these links:
- [JS Testing in 2018](https://medium.com/welldone-software/an-overview-of-javascript-testing-in-2018-f68950900bc3) - A really great high level look at testing.
- [@vue/test-utils](https://vue-test-utils.vuejs.org/en/guides/common-tips.html) - A source of inspiration (and one of the main tools used) for this mode and great introduction to testing in general.
- [Bottazini's awesome list of gotchas](https://engineering.doximity.com/articles/five-traps-to-avoid-while-unit-testing-vue-js) - You need to read this, even if you are testing pro!
- [Test Smells](http://xunitpatterns.com/Test%20Smells.html) - Check out this great book - an oldie, but goodie!
- [Medium blog from Pixelmatters](https://medium.com/pixelmatters/unit-testing-with-vue-approach-tips-and-tricks-part-1-b7d3209384dc) - Good, sane advice.

Continuous Integration and E2E testing is a science. Cypress is an electron app that runs and manages integration testing, and we recommend using their dashboard service. Here are some places to get you started:
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices.html)
- [Cypress Example Recipes](https://github.com/cypress-io/cypress-example-recipes)
- [Cypress Dashboard](https://www.cypress.io/dashboard/)

Google's Lighthouse tool audits the performance, PWA, accessibility, best practices and SEO of your page. 



Although it is available to you within the devtools of the Chrome browser, we wanted to integrate it deeply into the testing mode so that you have its statistics immediately at hand. We recommend installing it globally:

```bash
$ yarn global add lighthouse
```

#### When you will want to have tests:
- When other developers want to make pull-requests against your existing code-base.
- When you are using test or spec driven patterns for software development.
- When you are using continuous integration to deliver artifacts for a website or an app.
- When things should be working but you can't figure out where the problem lies.

#### When you don't need tests:
- For simple POC projects where you know exactly what you are doing.
- If someone else is writing the code for you.
- If you work alone and know your code inside and out.

#### When you will wish you had started testing:
- Today. Seriously - do it now!

#### Some tips about Vue testing
> - Run two terminals, one for "quasar test" and another for "quasar dev". This way they will both be running in separate threads, which will speed up your build time during development.
> - Use a script to serve up the lighthouse, the 

#### Can you please add *%new_testing_dialect_here%* to quasar-cli
There are many different ways to test code, and it is impossible for the Quasar team to implement all of them. We have tried to cover all of the bases by generating a scaffolding that you can use today. Perhaps someday another testing dialect will arise, for which you want integration with `quasar-cli` - and in that case, we ask you to file it as a feature request in the issues, fork the repo, add the testing framework and make a pull-request.

#### Thanks to:
mgibson91, flopail, rstoenescu and dennythecoder for helping out with this and putting up with yarn linking!

  
# Denjell's Notes
  - Update Getting Started / Quasar Cli with quasar test
  - Update Build commands
  - CI integration (Robin)
  - https://github.com/jprichardson/electron-mocha
  - https://stackoverflow.com/questions/50037628/can-not-get-vuex-state-using-cypress (actually a quasar question)
  - integrate node-tap as an option for testing https://github.com/tapjs/node-tap
  
Moving Forward  
  - https://github.com/phonegap/ios-sim
  - consider Nightwatch option in addition to Cypress
  
