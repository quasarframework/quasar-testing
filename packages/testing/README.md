## Testing Harnesses Manager

> You're looking at Quasar v1 Harnesses Manager AE docs. This AE has been migrated to support Quasar v2 and has been released as stable, you can find the documentation for the new stable release [here](https://github.com/quasarframework/quasar-testing/tree/next/packages/testing)
>
> Since it has been released as stable under "latest" tag, you'll need to use "qv1" tag to install the Quasar v1 version

```shell
$ quasar ext add @quasar/testing@qv1
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

If you chose to add package.json scripts during your harnesses installation, you can directly reference those scripts into the testing configuration to keep a single source of truth.

Testing configuration for a project with Jest and Cypress harnesses installed, both with package.json scripts:

```json
// quasar.testing.json

{
  "e2e-cypress": {
    "runnerCommand": "yarn test:e2e:ci"
  },
  "unit-jest": {
    "runnerCommand": "yarn test:unit:ci"
  }
}
```

You can spawn out an HMR dev environment by using `--dev` flag, but it's better to rely on every harness script in many cases. Options you provide to `--dev` will be added to the dev server options. This approach can be useful if you need to test a particular Quasar mode:

```sh
# Run jest && dev server in pwa mode
$ quasar test --unit jest --dev="-m pwa"
```

> If you don't want to install the Testing Harnesses Manager or have any problems with it whatsoever, you can install each test harness App Extension individually as they are completely standalone.
