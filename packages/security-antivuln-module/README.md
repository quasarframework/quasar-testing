@quasar/security-antivuln
===

> This module will expose methods allowing you to check your / other modules dependencies don't have any warnings in NPM dependency warnings located here: https://www.npmjs.com/advisories

## Contents

- [Install](#Install)
- [Uninstall](#Uninstall)
- [Dependency Scanning Quick Start](#Quick-Start)
- [AntiVuln](#AntiVuln)  
  - [Usage](#AntiVuln-Usage)  
  - [API](#AntiVuln-API)
- [Package Lock File Parser](#PackageLockFileParser)  
  - [API](#PackageLockFileParser-API)

## Install

With npm

```bash
npm install @quasar/security-antivuln
``` 

With yarn

```bash
yarn add @quasar/security-antivuln
```

## Uninstall

With npm

```bash
npm uninstall @quasar/security-antivuln
``` 

With yarn

```bash
yarn remove @quasar/security-antivuln
```

## Quick Start

Standard usage will check for yarn / npm package lock files and compare dependencies in those files with those on the NPM warning list.

It's worth noting the `AntiVuln.run()` command is very opinionated and has been designed to get you up and running with minimal effort. For more advanced usage (and no opinionated `console.log()`) please refer to the [AntiVuln API](antivuln-api).

```js
const AntiVuln = require('@quasar/security-antivuln').antiVulnLib

const antiVuln = AntiVuln('path/to/your/project/root')
antiVuln.run().then(threats => {
  if (threats.length > 0) {
    // Console shows something like this:
    /*
    Security Alert: [high] [ids-enterprise]
      Type: Cross-Site Scripting
      Advisory Version: <4.18.2
      Current version: 4.18.0
      Recommendation: Upgrade to version 4.18.2 or later
      Url: https://npmjs.com/advisories/957
      Detail: Versions of `ids-enterprise` prior to 4.18.2 are vulnerable to Cross-Site Scripting (XSS). The `modal` component fails to sanitize input to the `title` attribute, which may allow attackers to execute arbitrary JavaScript.
    */
  } else {
    // Console shows: Success:  No advisories for any dependencies.
  }
}).catch(() => {
  // Not expected; something bad happened.
})
```

Once the call has been run, output will be saved to:
```
your-application-folder/test/audits/security/antivuln/bad.packages.result.json
```

The contents of that file will be similar to:

```json
{
  "status": "fail",
  "runAt": 1560426465,
  "totalAdvisories": 1,
  "advisories": [
    {
      "name": "ids-enterprise",
      "version": "<4.18.2",
      "title": "Cross-Site Scripting",
      "recommendation": "Upgrade to version 4.18.2 or later",
      "severity": "high",
      "overview": "Versions of `ids-enterprise` prior to 4.18.2 are vulnerable to Cross-Site Scripting (XSS). The `modal` component fails to sanitize input to the `title` attribute, which may allow attackers to execute arbitrary JavaScript.",
      "url": "https://npmjs.com/advisories/957",
      "currentVersion": "4.18.0"
    }
  ]
}
```

## AntiVuln

AntiVuln is the library doing the leg work in the dependency checking. It exposes some methods to allow you to write your own checks or contains a single command `run()` to do it for you.

## AntiVuln Usage

In addition to the [quick start example above](#quick-start) you can also add your own lock files to test. Currently AntiVuln will automatically look for `package-lock.json` and `yarn.lock`. 

You can extend this by doing the following:

```js
const AntiVuln = require('@quasar/security-antivuln').antiVulnLib
const antiVuln = AntiVuln('path/to/your/project/root')

// Register a new parser for AntiVuln to use
antiVuln.registerParser('yarn.lock', () => {
  return [{
    name: 'ids-enterprise',
    version: '4.0.18'
  }]
})

antiVuln.run().then(threats => {
  if (threats.length > 0) {
    // Console shows something like this:
    /*
    Security Alert: [high] [ids-enterprise]
      Type: Cross-Site Scripting
      Advisory Version: <4.18.2
      Current version: 4.18.0
      Recommendation: Upgrade to version 4.18.2 or later
      Url: https://npmjs.com/advisories/957
      Detail: Versions of `ids-enterprise` prior to 4.18.2 are vulnerable to Cross-Site Scripting (XSS). The `modal` component fails to sanitize input to the `title` attribute, which may allow attackers to execute arbitrary JavaScript.
    */
  } else {
    // Console shows: Success:  No advisories for any dependencies.
  }
}).catch(() => {
  // Not expected; something bad happened.
})
```

The example above registers a new parser which returns an array of `{ name, version }` objects. AntiVuln will then use this parser (as well as the built in npm and yarn ones) when the `run()` command is called.

Please see the [API](#antivuln-api) for more information on using the internals without the opinionated `run()` command.  

## AntiVuln API

Include the AntiVuln library in your project like so: 
```js
const AntiVuln = require('@quasar/security-antivuln').antiVulnLib`
```

###`const antiVuln = AntiVuln('path/to/your/project/root')`

* `lockFileDir`: The root directory containing your `yarn.lock` or `package-lock.json` files. This is only used for the built in yarn and npm parsers.

**Returns:** Instantiated AntiVuln object

### `antiVuln.run()`

Will run an opinionated routine which logs to the console and a file the results from the current registered parsers.

See the [quick start example above](#quick-start) for more information on this.

### `antiVuln.getAdvisories`

Contacts the NPM dependency registry of unsafe packages.

**Returns:** All of the unsafe packages on the registry as an array of:

```jsdoc
  /**
   * @typedef {Object} AdvisoryPackage
   * @property {string} name - The package name
   * @property {string} version - The advisory version
   * @property {string} severity - The severity of the issue
   * @property {string} title - The type of advisory
   * @property {string} recommendation - The recommended action to resolve this issue
   * @property {string} url - The NPM package advisory url
   * @property {string} overview - An overview of the issue.
   */
```

### `antiVuln.getAdvisoryPackages`

Calls `antiVuln.getAdvisories` and compares the results with the packages retrieved from the currently registered parsers.

**Returns:** An array of objects - notice this is similar to the [advisories result](antiVuln.getAdvisories) but with the
addition of the current version parameter.

```jsdoc
  /**
   * @typedef {Object} AdvisoryPackage
   * @property {string} name - The package name
   * @property {string} version - The advisory version
   * @property {string} severity - The severity of the issue
   * @property {string} title - The type of advisory
   * @property {string} currentVersion - The version that is currently installed
   * @property {string} recommendation - The recommended action to resolve this issue
   * @property {string} url - The NPM package advisory url
   * @property {string} overview - An overview of the issue.
   */
```

### `antiVuln.registerParser`

Calls the internal [packageLockFileParser.registerParser](#packageFileLockParserregistercommand) command.

### `antiVuln.unregisterParser`

Calls the internal [packageLockFileParser.unregisterParser](#packageFileLockParserunregistercommand) command.

### `antiVuln.logFile(fileName, content)`

Creates a log file in `lockFileDir/tests/security/audit/antivuln/`

* `fileName` (string): The name of the file to be saved.
* `content` (Object): The data you want saved to the file (will be run through JSON.stringify())

**Returns:** Nothing but saved content is in the format of:

```
{
  "status": "success",
  "runAt": 1560586259,
  "totalAdvisories": 0,
  "advisories": []
}
```

### `antiVuln.logWarning (advisoryPackage)`

Will log to the console the package information returned via [antiVuln.getAdvisoryPackages](#antivulngetadvisorypackages).

* `advisoryPackage` (Object) - The package to log.

Console output will be similar to:

```
Security Alert: [high] [ids-enterprise]
  Type: Cross-Site Scripting
  Advisory Version: <4.18.2
  Current version: 4.18.0
  Recommendation: Upgrade to version 4.18.2 or later
  Url: https://npmjs.com/advisories/957
  Detail: Versions of `ids-enterprise` prior to 4.18.2 are vulnerable to Cross-Site Scripting (XSS). The `modal` component fails to sanitize input to the `title` attribute, which may allow attackers to execute arbitrary JavaScript.
```

## PackageLockFileParser

PackageLockFileParser is a helper utility used by AntiVuln to extract package information from the package repository lock files.

Generally speaking you would use the AntiVuln wrapper functions `registerParser` or `unregisterParser` to access the underlying PackageLockFileParser instance but you can also use the class directly.

## PackageLockFileParser API

Include the PackageLockFileParser library in your project like so: 
```js
const PackageLockFileParser = require('@quasar/security-antivuln').packageLockFileParser`
```

###`const packageLockFileParser = PackageLockFileParser('path/to/your/project/root')`

* `lockFileDir` (string)[optional]: The root directory containing your `yarn.lock` or `package-lock.json` files. This is only used for the built in yarn and npm parsers. If this is omitted no default parsers will be registered.

**Returns:** Instantiated PackageLockFileParser object

### `packageLockFileParser.getPackageFromKey (packageMunge)`

A method used to convert a commonly used organisation / package / version munge into a package name.

* `packageMunge` (string) - The munge to extrapolate the package name from.

**Returns:** A string of the package name.

*Example*

```js
return getPackageFromKey('@ava/babel-plugin-throws-helper@^3.0.0')
// result: 'babel-plugin-throws-helper'
``` 

### `packageLockFileParser.getParsers`

**Returns:** An array of currently registered parsers. 

### `packageLockFileParser.registerParser (filePath, fn)`

Registers a new parser which will be processed when `parse()` is called.

* `filePath` (string) - The full path to the lock file.
* `fn` (Callback) - The function that will convert that lock file into an object of `{ name, version }`

### `packageLockFileParser.unregisterParser (filePath)`

Unregisters a previously registered parser.

* `filePath` (string) - The full path to the lock file (which matches the one it was registered with)

### `packageLockFileParser.parse`

Goes through all the registered parsers and compiles a list of packages.

**Returns:** An array of Objects, e.g

```js
{
  lockFile: parser.filePath,
  packages: [{name, version}]
}
```

### `packageLockFileParser.parseYarnLock (filePath)`

A function that contains the logic to parse the yarn.lock file.

Note: This is automatically called when the `PackageLockFileParser` class is instantiated providing the `lockFileDir` prop is specified.

* `filePath` (string) - The full path to the lock file

**Returns:** An array of `{name, version}` package information.

### `packageLockFileParser.parseNpmLock (filePath)`

A function that contains the logic to parse the package-lock.json file.

Note: This is automatically called when the `PackageLockFileParser` class is instantiated providing the `lockFileDir` prop is specified .

* `filePath` (string) - The full path to the lock file

**Returns:** An array of `{name, version}` package information.


## Patreon
If you like (and use) this App Extension, please consider becoming a Quasar [Patreon](https://www.patreon.com/quasarframework).
