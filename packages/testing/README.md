## Testing Harnesses Manager

```shell
$ quasar ext add @quasar/testing
```

This AE is meant to centralize the management of all testing harnesses.

When added (or re-added) it will let you choose which testing harnesses you want and install them.
It will provide a new `quasar test` command which you can use to run your tests.

### `quasar test`

You can use `quasar test` command like

```sh
# Execute Jest tests
$ quasar test --unit jest
# Execute Cypress tests
$ quasar test --e2e cypress
# Execute Jest, Cypress and Security tests
$ quasar test --unit jest --e2e cypress --security
```

Commands to be run are stored into the testing configuration file, `quasar.testing.json`, and will be executed verbatim.
The file is created/updated when a new harness is added.
Commands provided there by default are ready to be used into a CI environment.
You can change the `runnerCommand` property as you please.

Testing configuration for a project with only Jest harness installed will be:

```json
// quasar.testing.json

{
  "unit-jest": {
    "runnerCommand": "jest --ci"
  }
}
```

You can spawn out an HMR dev environment by using `--dev` flag, but it's better to rely on every harness script in many cases. Options you provide to `--dev` will be added to the dev server options. This approach can be useful if you need to test a particular Quasar mode:

```sh
# Run jest && dev server in pwa mode
$ quasar test --unit jest --dev="-m pwa"
```

> If you don't want to install the Testing Harnesses Manager or have any problems with it whatsoever, you can install each test harness App Extension individually as they are completely standalone.
