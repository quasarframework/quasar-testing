# Quasar App Extension quasar-playwright

_Be sure to change this readme as appropriate for your app extension._

_Think about the organization of this file and how the information will be beneficial to the user._

> Add a short description of your App Extension. What does it do? How is it beneficial? Why would someone want to use it?

A Quasar playwright app extension

# Install

```bash
quasar ext add quasar-playwright
```

Quasar CLI will retrieve it from the NPM registry and install the extension to your project.

## Prompts

> Explain the prompts here

# Uninstall

```bash
quasar ext remove quasar-playwright
```

# Info

> Add longer information here that will help the user of your app extension.

# Other Info

> Add other information that's not as important to know

# Donate

If you appreciate the work that went into this App Extension, please consider [donating to Quasar](https://donate.quasar.dev).

# Dialog

Require `nextTick`

# Eslint

```js
  {
    ...playwright.configs['flat/recommended'],
    files: ['src/components/**/*.spec.ts', 'test/**/*.spec.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      '@typescript-eslint/unbound-method': 'off',
    },
  },
```
