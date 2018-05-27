title: Unit Tests
---
<a href="https://github.com/DevExpress/testcafe">
    <img alt="tested with chai" src="https://img.shields.io/badge/tested with-chai-2fa4cf.svg">
</a>
<a href="https://github.com/DevExpress/testcafe">
    <img alt="Tested with sinon" src="https://img.shields.io/badge/tested%20with-sinon-2fa4cf.svg">
</a>
<a href="https://github.com/DevExpress/testcafe">
    <img alt="Tested with jest" src="https://img.shields.io/badge/tested%20with-jest-2fa4cf.svg">
</a>

A unit test is composed of two main parts:
- A file to be tested `[.js|.vue|.ts]`
- A `.spec.js` that imports the file to be tested.

For the way that we have pre-configured Mocha-Webpack, you must use the suffix `.unit.js` when naming your spec file. It is also a good practice to name your spec file according to the file that you are testing.

WARNING!
- Your unit tests must be perfectly tabbed (2 space = 1 tab) - because of the aggressive linting that unit test-runners expect.

We have integrated support for three widely accepted unit test dialects:
- [chai](http://www.chaijs.com/) (namespaced as expect via `global.expect = require('chai').expect`) ??? is this a good idea?
- [sinon](http://sinonjs.org/) - for spies, stubs and mocks
- [jest](https://facebook.github.io/jest/) - all-in-one behemoth from F*cebook

If you want to know more about the systemic differences between these different "flavours" of unit tests, please feel free to have a look at [this npm compare page](https://npmcompare.com/compare/chai,jest,sinon).

If you are wondering about why we chose mocha-webpack instead of one of the others, [check out this table showing the speed of various test runners](https://github.com/eddyerburgh/vue-unit-test-perf-comparison):

| Runner        | 10 tests  | 100 tests  | 1000 tests | 5000 tests |
| :------------ |:--------- |:---------  |:---------  |:--------- |
| tape | 2.32s |  3.49s |  9.28s |  38.31s |
| jest | 2.44s |  4.50s |  21.84s |  91.91s |
| MOCHA-WEBPACK | 2.32s |  3.07s |  10.79s |  38.97s |
| karma-mocha | 7.93s |  11.01s |  33.30s |  119.34s |
| ava | 19.05s |  73.44s |  625.15s |  7161.49s |
