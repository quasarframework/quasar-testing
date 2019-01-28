title: Code Coverage
---
<a href="https://github.com/istanbuljs/nyc">
    <img alt="coverage by nyc" src="https://img.shields.io/badge/coverage by-istanbul/nyc-2fa4cf.svg">    
</a>

According to the module authors, "Istanbul instruments your ES5 and ES2015+ JavaScript code with line counters, so that you can track how well your unit-tests exercise your codebase." That means it sees how much of your source code files for which you have specs are really being investigated. It generates both a nice ASCII report as well as a thorough html version that actually lets you click through to find the parts of your code that are not being tested by your unit tests. You could say that you test coverage to test tests. But you wouldn't. That would sound silly.

- https://istanbul.js.org/docs/advanced/alternative-reporters/


Sometimes you may wish to have the coverage tracking ignored. Here are comments that you can use in your source files to assist you in [cheating the coverage](https://github.com/istanbuljs/nyc#parsing-hints-ignoring-lines):

```
/* istanbul ignore if */    // ignore the next if statement.
/* istanbul ignore else */  // ignore the else portion of an if statement.
/* istanbul ignore next */  // ignore the next thing in the source-code.
/* istanbul ignore file */  // ignore an entire source-file.
```

### Integration guides:
- [coveralls.io](https://github.com/istanbuljs/nyc#integrating-with-coveralls)
- [codecov](https://github.com/istanbuljs/nyc#integrating-with-codecov)
- [TAP](https://github.com/MegaArman/tap-nyc) - WIP [Read more](https://en.wikipedia.org/wiki/Test_Anything_Protocol)
