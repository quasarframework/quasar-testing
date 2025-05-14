# Quasar App Extension for Playwright Testing

This Quasar App Extension integrates [Playwright](https://playwright.dev) with Quasar Framework, providing a seamless testing experience for both end-to-end (E2E) and component testing.

## Installation

```bash
# any other package manager can be used
yarn quasar ext add @quasar/testing-e2e-playwright
```

## ESLint Configuration

- We higly recommend that you set up ESLint in your project, and use it to lint your code. Apart from helping you catch potential bugs in your code, it will also catch some potential issues with your tests. For example, you might forget to `await` a test when you are supposed to and end up with a flaky test suite.

### ESLint v9+ (Flat Config)

For ESLint v9 and newer, add this to your `eslint.config.js`:

```js
import playwright from 'eslint-plugin-playwright';

export default [
  // ...
  {
    ...playwright.configs['flat/recommended'],
    files: ['src/components/**/*.spec.ts', 'test/**/*.spec.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      //  you might need to disable this rule if it's turned on to avoid `mount` being reported as unbound
      // '@typescript-eslint/unbound-method': 'off',
    },
  },
];
```

### ESLint v8 and Earlier (Legacy Config)

For ESLint versions earlier than v9, add this to your `.eslintrc.js` or `.eslintrc.json`:

```js
{
  "overrides": [
    {
      "files": ["src/components/**/*.spec.{js,ts}", "test/**/*.spec.{js,ts}"],
      "extends": "plugin:playwright/recommended",
      "rules": {
        //  you might need to disable this rule if it's turned on to avoid `mount` being reported as unbound
        // "@typescript-eslint/unbound-method": "off"
      }
    }
  ]
}
```

For TypeScript projects using ESLint v8, you might also need to add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["node", "playwright", "@playwright/test"]
  }
}
```

---

This App Extension (AE) manages Quasar and Playwright integration for you, supporting both JavaScript and TypeScript projects. It provides specialized utilities for testing Quasar components and a simplified setup for both end-to-end (E2E) and component testing.

## Included Utilities

The extension comes with several custom utilities to simplify testing Quasar components:

| Utility                  | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `selectDate`             | Selects a date in a QDate component                      |
| `selectQSelectOption`    | Selects options from a QSelect component                 |
| `checkQuasarComponent`   | Checks Quasar checkboxes, toggles, and radio buttons     |
| `uncheckQuasarComponent` | Unchecks Quasar checkboxes and toggles                   |
| `expectQuasarChecked`    | Asserts that a Quasar component is checked/unchecked     |
| `withinDialog`           | Interacts with elements within a QDialog                 |
| `withinMenu`             | Interacts with elements within a QMenu                   |
| `withinSelectMenu`       | Interacts with options within a QSelect dropdown         |
| `expectColor`            | Asserts the text color of an element                     |
| `expectBackgroundColor`  | Asserts the background color of an element               |
| `test` and `expect`      | Custom test fixtures with enhanced coverage capabilities |

See example usage in the test files created during installation.

## Usage

After installation, these scripts are added to your `package.json`:

```bash
# Run all tests
npm run test

# Run E2E tests with UI
npm run test:e2e

# Run E2E tests in CI mode
npm run test:e2e:ci

# Run component tests with UI (Vite only)
npm run test:component

# Run component tests in CI mode (Vite only)
npm run test:component:ci

# Show test report
npm run test:report

# Clear test artifacts
npm run test:clear

# Generate coverage report (when enabled)
npm run coverage-report
```

## Examples

### Testing Quasar Button

```ts
import {
  test,
  expect,
} from '@quasar/quasar-app-extension-testing-e2e-playwright';

test('clicks a button', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Click me' }).click();
  await expect(page.locator('.result')).toContainText('Clicked!');
});
```

### Testing Date Picker

```ts
import {
  test,
  expect,
  selectDate,
} from '@quasar/quasar-app-extension-testing-e2e-playwright';

test('selects a date', async ({ page }) => {
  await page.goto('/datepicker');
  const datePicker = page.locator('.q-date');
  await selectDate(datePicker, '2023/07/15');
  await expect(page.locator('.selected-date')).toContainText('Jul 15, 2023');
});
```

### Testing Dialog

```ts
import {
  test,
  expect,
  withinDialog,
} from '@quasar/quasar-app-extension-testing-e2e-playwright';

test('interacts with dialog', async ({ page }) => {
  await page.goto('/dialog');
  await page.getByRole('button', { name: 'Open Dialog' }).click();

  await withinDialog(page, async (dialog) => {
    await expect(dialog).toContainText('Confirm Action');
    await dialog.getByRole('button', { name: 'OK' }).click();
  });

  await expect(page.locator('.result')).toBeVisible();
});
```

### Testing Form Controls

```ts
import {
  test,
  expect,
  checkQuasarComponent,
  uncheckQuasarComponent,
  expectQuasarChecked,
} from '@quasar/quasar-app-extension-testing-e2e-playwright';

test('interacts with form controls', async ({ page }) => {
  await page.goto('/form');

  const checkbox = page.locator('.q-checkbox');
  await checkQuasarComponent(checkbox);
  await expectQuasarChecked(checkbox, true);

  await uncheckQuasarComponent(checkbox);
  await expectQuasarChecked(checkbox, false);
});
```

## Component Testing

Component testing is supported for Vite-based Quasar projects, allowing you to test Vue components in isolation. At the moment, we are not supporting component testing for Webpack-based projects.

```ts
import {
  test,
  expect,
} from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';
import MyButton from '../MyButton.vue';

test('renders button with label', async ({ mount }) => {
  const component = await mount(MyButton, {
    props: { label: 'Click Me' },
  });

  await expect(component).toContainText('Click Me');
  await component.click();
  // Test component behavior...
});
```

For Quasar-specific components in component testing mode:

```ts
import {
  test,
  expect,
  selectQSelectOption,
} from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';
import QSelectWrapper from '../QSelectWrapper.vue';

test('selects an option', async ({ mount }) => {
  const component = await mount(QSelectWrapper);
  await selectQSelectOption(component, 'Option 1');
  // Test component behavior...
});
```

## Code Coverage

When enabled during installation, code coverage is automatically configured for Vite-based projects using Istanbul. The implementation:

- Instruments your code automatically during development/testing
- Collects coverage data during test execution
- Works with both E2E and component tests
- Combines results from different test types for unified reporting

### Running with Coverage

Coverage data is collected automatically when running tests with the CI commands:

```bash
# Run E2E tests with coverage
npm run test:e2e:ci

# Run component tests with coverage
npm run test:component:ci

# Run both for combined coverage
npm run test
```

After test execution, generate a comprehensive report with:

```bash
npm run coverage-report
```

### Coverage Reports

The generated reports will be available in the `coverage` directory in multiple formats:

- **HTML**: Interactive browser-based report (`coverage/index.html`)
- **Text**: Command-line summary
- **LCOV**: Standard format for CI integrations

### Customization

The extension provides a sensible default configuration that extends the Istanbul preset. You can customize coverage settings by:

1. Modifying the `.nycrc` file in your project root
2. Adjusting the environment variables in your `package.json` scripts
3. Creating a custom NYC configuration

## Configuration Options

During installation, you'll be prompted to configure:

- **Port**: The port to use for serving the app during tests (default: 8080)
- **GitHub Workflow**: Add a GitHub workflow configuration for CI
- **Install Browsers**: Install Playwright browsers automatically. On Linux, it works only on Debian-based distros. You might still be able to install browsers on other Linux distros with some tweaking which is out of the scope of this documentation.
- **Code Coverage**: Enable code coverage reporting (Vite only)

## Tips

- When testing QDialog components in component tests, you might notice a random error about navigation context being changed during component mount. Here's an explanation and workaround for that:

```ts
onMounted(async () => {
  // When rendering a dialog immediately when the component is mounted, we need to wait for the next tick, otherwise it will break the test. Apparently, rendering the dialog immediately
  // interfers with component mount context. This mostly occurs when running individual tests that immediately render a dialog and rarely when running all tests at once.
  // It throws: "Error: page._wrapApiCall: Execution context was destroyed, most likely because of a navigation."
  // This is only needed to make Playwright tests that display the dialog immediately after mounting the component pass. If a dialog is not displayed immediately the component renders then you don't need this.
  await nextTick();

  Dialog.create({
    component: props.component,
  });
});
```

## Uninstallation

```bash
quasar ext remove @quasar/testing-e2e-playwright
```

## Documentation

For more details:

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Quasar Framework](https://quasar.dev)

## Donate

If you appreciate this extension, please consider [donating to Quasar](https://donate.quasar.dev).
