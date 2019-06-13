@quasar/testing-security-antivuln
===

> This testing app extension will scan your installed dependencies (the entire chain) and compare them with the list of 
> advisories found here: https://www.npmjs.com/advisories warning you if any are unsafe.

# Install
Installation *should* be done via the `@quasar/testing` mono repo using 

```bash
quasar ext add @quasar/testing
``` 

Then selecting the `Security Anti-Vulnerability` harness. If you do need to install this application extension on independantly you can use:

```bash
quasar ext add @quasar/testing-security-antivuln
```
Quasar CLI will retrieve it from NPM and install the extension.

## Prompts

This app extension will prompt for 3 options:

* `Scan when running quasar dev` - Enabling this will cause the scan to run when you run `quasar dev`
* `Scan when running quasar build` - Enabling this will cause the scan to run when you run `quasar build`
* `Strict Mode` - If enabled and if vulnerabilities are found, script execution will stop when runOnDev and / or runOnBuild are true.
# Uninstall

If installed via `@quasar/testing` then just run the install again and don't select the `Security Anti-Vulnerability` harness.

If installed direct, run:
```bash
quasar ext remove @quasar/testing-security-antivuln
```

# Running

```bash
quasar test --security antivuln
```

# Testing
If you would like to test the output / how this works. You can add any package that exists in the [NPM Advisory List](https://www.npmjs.com/advisories) for instance:

```bash
yarn add ids-enterprise@4.18.0
```

When you've added this package to your project, run:

```bash
quasar test --security antivuln
```

And you will see output similar to (albeit with a little more color):

```powershell
Security Alert: [high] [ids-enterprise]
  Type: Cross-Site Scripting
  Advisory Version: <4.18.2
  Current version: 4.18.0
  Recommendation: Upgrade to version 4.18.2 or later
  Url: https://npmjs.com/advisories/957
  Detail: Versions of `ids-enterprise` prior to 4.18.2 are vulnerable to Cross-Site Scripting (XSS). The `modal` component fails to sanitize input to the `title` attribute, which may allow attackers to execute arbitrary JavaScript.
```

#####IMPORTANT
> Remember to remove the unsafe package you've added for testing. 

# Output

Once the test has run, output will be saved to
```
your-application-folder/test/audits/security/antivuln/bad.packages.result.json
```

The output will be similar to (or exactly the same if you're following the Testing section above):

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

# Possible Roadmap 
* Fix option
* HTML bad package browser.

# Patreon
If you like (and use) this App Extension, please consider becoming a Quasar [Patreon](https://www.patreon.com/quasarframework).
