## Testing Harnesses Manager

### DEPRECATION NOTICE

This App Extension is deprecated.
It still works for Quasar v2 together with `q-app@v3`, `q-app-webpack@v3` or `q-app-vite@v1`, but it won't support newer versions of Quasar or `q-app-webpack`/`q-app-vite` packages.

The purpose of this AE was to make it easier for users to install and manage testing harnesses via a single command, by wrapping `quasar dev` command and other AEs scaffolded scripts.
In short, it was duplicating the scripts to run tests into `quasar.testing.json` and providing a new `quasar test` command to run them.
This seemed like a good idea at the time, but it turned out to be a bad one in the long run, as we added more harnesses and edge cases multiplied.
This actually caused many headaches both to maintainers and users, for little to no real value.

One notable example is that users stopped reading the READMEs of each harness, which caused them to miss some important steps to install the harnesses (e.g. linting support).
While many users eventually end up reading those READMEs, they inevitably got confused at first and this increased the number of help requests and issues opened on the repo.

The migration path is pretty straightforward:

- remove the AE via `quasar ext remove @quasar/testing`;
- delete `quasar.testing.json` file.

All the harnesses you installed via this AE won't be removed, so you can just keep using them by running the scripts they scaffolded scripts instead of `quasar test` command.
If you have any problems with other AEs, the best course of action is to remove the AE and install it again while carefully reading their README.

### Installation

```shell
$ quasar ext add @quasar/testing
```

This App Extension (AE) is meant to centralize the management of all testing harnesses.

When added (or re-added) it will let you choose which testing harnesses you want and install them.
It will provide a new `quasar test` command which you can use to run your tests.

It will only show currently maintained AEs which are compatible with Quasar v2.

### `quasar test`

You can use `quasar test` command like

```sh
# Execute Jest tests
$ quasar test --unit jest
# Execute Cypress tests
$ quasar test --e2e cypress
# Execute Jest and Cypress tests
$ quasar test --unit jest --e2e cypress
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
