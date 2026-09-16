## [Playwright](https://playwright.dev/)

```shell
$ npx quasar ext add @quasar/testing-playwright
# or
$ yarn quasar ext add @quasar/testing-playwright
# or
$ pnpm quasar ext add @quasar/testing-playwright
```

Then install the browsers once:

```shell
$ npx playwright install
# or
$ pnpm exec playwright install
```

This App Extension (AE) manages Quasar and Playwright integration for you, both for JavaScript and TypeScript. It scaffolds:

- `playwright.config.[ts|js]` with an `e2e` project and a `components` project, both served by one `quasar dev`;
- example components, stories and tests, when you answer yes to the demo prompt;
- `test`, `test:e2e`, `test:e2e:ci`, `test:component`, `test:component:ci` and `test:report` scripts, plus `test:coverage:report` with coverage;
- optional Istanbul code coverage;
- an optional `.github/workflows/playwright.yml` GitHub Actions workflow.

It also generates the component gallery your stories render in, from your `index.html`, `quasar.config` and boot files, so nothing about the gallery is scaffolded into your app.

This AE is a wrapper around Playwright, read [the official documentation](https://playwright.dev/docs/intro) first.

A re-invoke (`quasar ext invoke @quasar/testing-playwright`) adds and overwrites files, it never removes any: answering no to coverage or to the demo suite leaves the earlier files in place. To change the port, edit `devServerPort` at the top of `playwright.config`.

### Prompts

`quasar ext add` asks four questions:

- **code coverage**, default no. Adds `nyc`, the Istanbul plugin, a `.nycrc` and the `test:coverage:report` script.
- **the demo suite**, default yes. Writes example components, stories and specs under `test/playwright/demo/`. You can delete that whole directory once you checked the examples and wrote your own stories and specs.
- **a GitHub Actions workflow**, default no. Writes `.github/workflows/playwright.yml`, described under Continuous integration.
- **installing Chromium**, default yes. Runs the Playwright browser install through your package manager.

### Requirements

- `@quasar/app-vite` v3.8 or newer and `quasar` v2.31 or newer;
- `vue` v3.5 or newer;
- `@playwright/test` v1.63 or newer;
- component testing runs against `quasar dev` in SPA mode. SSR and SSG dev servers do not serve the gallery page. E2E tests work with any mode `quasar dev` serves over HTTP.

### E2E tests

E2E tests live in `test/playwright/e2e`. Playwright starts `quasar dev` through its `webServer` option, passing `QUASAR_TESTING_PLAYWRIGHT=true` and the port from `devServerPort` at the top of `playwright.config`. Under `QUASAR_TESTING_PLAYWRIGHT=true` the AE keeps the browser closed, listens on that port and, when enabled, instruments the code for coverage.

Locally, a `quasar dev` that is already running is reused (`reuseExistingServer`), but only when it listens on the port in `playwright.config`. A plain `quasar dev` uses Quasar's own port, 9000 by default, so Playwright starts its own server alongside it. To run one server yourself on the port the tests use, set both variables: `QUASAR_TESTING_PLAYWRIGHT=true QUASAR_TESTING_PLAYWRIGHT_PORT=8080 quasar dev`.

### Authentication

Log in once and reuse the session, instead of logging in at the start of every test. Playwright does this with a setup project that saves the browser storage to a file and test projects that start from that file:

```ts
// test/playwright/auth.setup.ts
import { expect, test as setup } from './fixtures';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('email-field').fill('user@example.com');
  await page.getByTestId('password-field').fill('secret');
  await page.getByTestId('submit-button').click();
  await expect(page.getByTestId('user-menu')).toBeVisible();
  await page
    .context()
    .storageState({ path: 'test/playwright/.auth/user.json' });
});
```

```ts
// playwright.config.ts, inside projects
{
  name: 'setup',
  testDir: 'test/playwright',
  testMatch: /auth\.setup\.ts$/,
  use: { ...devices['Desktop Chrome'], baseURL: appUrl },
},
{
  name: 'e2e',
  testDir: 'test/playwright/e2e',
  dependencies: ['setup'],
  use: { ...devices['Desktop Chrome'], baseURL: appUrl, storageState: 'test/playwright/.auth/user.json' },
},
```

A spec that tests the login itself opts out with `test.use({ storageState: { cookies: [], origins: [] } })`. Add `test/playwright/.auth/` to `.gitignore`. Quasar's `LocalStorage` plugin and cookies are captured as they are; `sessionStorage` is not, see the [Playwright authentication guide](https://playwright.dev/docs/auth) for that case. Logging in through the API instead of the form is faster when the app exposes how it stores the session. For a fixture that logs in through the API, see [Authentication](#authentication-1) in the GraphQL chapter.

Several roles: one setup test and one state file per role, and `test.use({ storageState: adminFile })` in the specs that need it. To log in lazily instead, a worker-scoped fixture can log a role in on its first use and cache the state file per role and worker, exposed as a `role` option: tests start without a session and a file or a describe block picks one with `test.use({ role: 'admin' })`. Tests where two users interact open a second context with the other role's state. The [Playwright authentication guide](https://playwright.dev/docs/auth) documents both patterns.

### Testing the production bundle

`quasar dev` serves the tests by default. To run them against the bundle that ships, for instance on CI, switch the `webServer` command in `playwright.config`:

```ts
webServer: {
  command: process.env.CI
    ? 'quasar build && quasar serve dist/spa --history --port 8080'
    : 'quasar dev',
  url: appUrl,
  reuseExistingServer: !process.env.CI,
  timeout: process.env.CI ? 300_000 : 60_000,
  env: { QUASAR_TESTING_PLAYWRIGHT: 'true' },
},
```

`quasar serve` comes with `@quasar/cli`. `QUASAR_TESTING_PLAYWRIGHT=true` on the build keeps the code coverage instrumentation, so `test:coverage:report` works on CI runs too. Do not set `NODE_ENV=test` on the build: Vue and most libraries would ship in development mode. Component tests always run against `quasar dev`.

### Continuous integration

Answer yes to the "Add a GitHub Actions workflow that runs the tests?" prompt and the AE writes `.github/workflows/playwright.yml`.

The workflow uses your package manager and your Node version, read from `.node-version`, `.nvmrc` or `engines.node` in `package.json`, and defaults to the current LTS if none is specified. It installs Chromium only, runs `playwright test` once, and uploads `playwright-report/` and `coverage/`(if coverage is enabled) as an artifact for 30 days.

The file is written only when it does not exist yet, so a re-invoke keeps your edits.

Edit it to fit your project: the branch names under `on.push`, the browsers in the install step when you add projects to `playwright.config`, and the production bundle command described above, which applies under `CI` because GitHub Actions sets it.

With pnpm and no `packageManager` field in `package.json`, the workflow pins `version: latest` for `pnpm/action-setup`. Replace it with the version you use, or add the field and delete the `with:` block.

If your app is not at the repository root, a package of a monorepo for instance, the Playwright steps get a `working-directory`, but move the file to `.github/workflows/` at the repository root since it's the only place GitHub reads workflows from, as the AE should tell you when it scaffolds the file.

### Component tests

Component tests use Playwright's [story gallery model](https://playwright.dev/docs/test-components): a **story** is a small component that wraps the component under test in one scenario, and the built-in `mount` fixture renders it by id.

#### Layout

```
playwright.config.ts
test/playwright/fixtures/index.ts    the app's test and expect, extend them with your fixtures and matchers
test/playwright/e2e/home.spec.ts
test/playwright/components/          your component specs
test/playwright/demo/                 optional: example components, stories and specs
```

The demo suite is scaffolded only when you answer yes to the demo prompt. Delete `test/playwright/demo/` when you no longer need it. Everything else is scaffolded either way. Without the demo suite, `test:component:ci` reports `No tests found` until you add your first spec under `test/playwright/components/`.

Stories are discovered under `src/` and under `test/playwright/`, in `*.story.[tsx|jsx|ts|js|vue]` files. Each named export of a `.tsx`, `.jsx`, `.ts` or `.js` story file is a story, and its id is the path from the app root without the `.story.*` extension plus the export name. A leading `src/` is dropped, so `src/components/Foo.story.tsx` gives ids like `components/Foo/Default`, while the demos keep their full path and give `test/playwright/demo/QuasarSelect/Default`. A `.story.vue` file is one story, addressed by that path alone.

The gallery is your app without its root component. `quasar dev` generates it from your `index.html`, `quasar.config` and boot files, so there is nothing to keep in sync by hand, and a new story doesn't need a restart. It boots Quasar with the `framework` options of your `quasar.config`, your router, your store when the app has one, then every boot file in order, with the same parameters as in the app. Each story renders inside `#root`. A boot file that calls `redirect()` or throws makes `mount()` reject with a message naming that boot file. Components that need a Quasar plugin such as `Dialog` or `Notify` work when the plugin is listed in `quasar.config` > `framework` > `plugins`, exactly as in the app. Boot files, css, extras and animations that another App Extension adds through its own `extendQuasarConf` reach the gallery only when that extension is listed before `@quasar/testing-playwright` in `quasar.extensions.json`.

The `components` project sets `reuseContext: true`, which reuses one browser context per worker across component tests and speeds suites up a lot. Playwright marks it experimental: it is ignored when `video` is on, and a `test.use()` change other than viewport, color scheme, user agent and a few emulation options creates a fresh context.

#### Customization

Customization is Quasar customization: `quasar.config`, `index.html`, boot files, env variables. Keep the `<!-- quasar:entry-point -->` marker in `index.html`, the gallery replaces it with its own mount point.

A boot file can skip the logic that must not run in the gallery. The gallery sets `globalThis.__QUASAR_PLAYWRIGHT_GALLERY__` to `true` before it imports the first boot file; the app and a server render never set it. A TypeScript app gets its declaration from `.quasar/playwright.d.ts`. Do not gate on `urlPath`, which is `/` in the gallery under hash mode.

```ts
import { defineBoot } from '#q-app';

export default defineBoot(({ app }) => {
  if (globalThis.__QUASAR_PLAYWRIGHT_GALLERY__) {
    return;
  }

  // the setup the gallery must not run
});
```

Toggle behavior for Playwright runs through `webServer.env` in `playwright.config`, which becomes process env for the `quasar dev` it starts. Quasar exposes `QCLI_`-prefixed variables as `import.meta.env.QCLI_*`, reachable from boot files and components:

```ts
webServer: {
  env: { QUASAR_TESTING_PLAYWRIGHT: 'true', QCLI_MOCK_AUTH: 'true' },
},
```

A `quasar dev` that Playwright reuses was started without these variables, so restart it after changing them.

#### Eject

To own the gallery page yourself, create `playwright/gallery/index.html` in the app. The AE then serves that file at the gallery URL instead of its generated one. Copy `.quasar/playwright-gallery/index.html` and `main.js`, written by a `quasar dev` run, into `playwright/gallery/`, point the script tag at `/playwright/gallery/main.js`, and own both files from then on. Nothing else is needed.

#### Writing stories

There are three ways to write a story: a TSX/JSX function, a `defineComponent` with a JSX or a render function, or a `.story.vue` single-file component.

A TSX/JSX story is the shortest form. A story that only passes props is a one-liner, and the props are type checked:

```tsx
// test/playwright/demo/QuasarSelect.story.tsx
import QuasarSelect from './QuasarSelect.vue';

export const Default = () => <QuasarSelect />;
export const Disabled = () => <QuasarSelect disable />;
```

Use `mount('test/playwright/demo/QuasarSelect/Disabled')` to render the second one.

A story that owns state returns the render function from `defineComponent`. Record what the test asserts into a hidden form:

```tsx
// test/playwright/demo/QuasarButton.story.tsx
import { defineComponent, ref } from 'vue';
import QuasarButton from './QuasarButton.vue';

export const Default = defineComponent(() => {
  const testEmitCount = ref(0);

  return () => (
    <>
      <QuasarButton onTest={() => testEmitCount.value++} />
      <form hidden>
        <input
          data-testid="test-emit-count"
          readonly
          value={String(testEmitCount.value)}
        />
      </form>
    </>
  );
});
```

```ts
// test/playwright/demo/QuasarButton.spec.ts
import { expect, test } from '../fixtures';

test('emits on click', async ({ mount }) => {
  const component = await mount('test/playwright/demo/QuasarButton/Default');
  await component.getByTestId('button').click();
  await expect(component.getByTestId('test-emit-count')).toHaveValue('1');
});
```

A `*.story.vue` single-file component is one story, addressed by its path alone: `src/components/Greeting.primary.story.vue` is mounted with `mount('components/Greeting.primary')`. Write one file per story. Prefer it for template-heavy and slot-heavy scenarios, and for a component that needs an ancestor:

```vue
<!-- test/playwright/demo/QuasarDrawer.inLayout.story.vue -->
<script setup lang="ts">
import QuasarDrawer from './QuasarDrawer.vue';
</script>

<template>
  <!-- QDrawer needs a QLayout ancestor -->
  <q-layout view="lHh Lpr lFf">
    <QuasarDrawer />
  </q-layout>
</template>
```

A render function works too: `export const Default = defineComponent(() => () => h(QuasarButton));`.

#### Typed story ids

A TypeScript project gets `.quasar/playwright.d.ts`, which lists every story file under `src/` and under `test/playwright/` and declares the gallery flag. It is generated like Quasar's own types: it exists after every install and `quasar dev` keeps it fresh, and there is nothing to commit or to exclude from linting.

With the registry in place, `mount()` autocompletes every story id and type-checks the props of the stories that declare them, both the function form `(props: { title?: string }) => ...` and a `defineComponent` with `props`. An id that is not in the registry still works, a short suffix such as `QuasarSelect/Disabled` for instance, but its props are not checked. A JavaScript project gets no registry.

Playwright ships this methodology as an agent skill: `npx playwright init-skills` installs it for coding agents.

### The `quasar` fixture and the matchers

Every spec imports `test` and `expect` from `test/playwright/fixtures/index.ts`. That file re-exports the AE's `test`, which carries the `quasar` fixture and the coverage collector, and the AE's `expect`, which carries the matchers. Extend both there, so every spec gets the app's own fixtures and matchers from the same import.

`quasar` is a [Playwright fixture](https://playwright.dev/docs/test-fixtures): take it from the first argument of the test function, next to `page` or `mount`. It works on the page of that test. For any other page, a popup for instance, `createQuasarFixture(page)` from the AE builds the same helpers.

```ts
import { expect, test } from '../fixtures';

test('asks before deleting', async ({ page, quasar }) => {
  await page.goto('/items/1');
  await page.getByTestId('delete-button').click();

  await quasar.withinDialog(async (dialog) => {
    await expect(dialog).toContainText('Delete this item?');
    await dialog.getByRole('button', { name: 'OK' }).click();
  });

  await expect(page).toHaveRoute('items');
});
```

| Name                                            | Usage                                                                                                                  | Description                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quasar.dialog(options?)`                       | `quasar.dialog()` <br /> `quasar.dialog({ testId: 'confirm-dialog' })`                                                 | Locator for the top-most open QDialog. Options: `testId`, `name` (aria-label), `last: false` for the bottom-most one.                                                                                                                                                                                                                    |
| `quasar.withinDialog(fn, options?)`             | `await quasar.withinDialog(async (dialog) => { await dialog.getByRole('button', { name: 'OK' }).click(); })`           | Runs the callback with the dialog locator, then waits for the dialog to be removed. `{ persistent: true }` skips that wait.                                                                                                                                                                                                              |
| `quasar.closeDialog(dialog, via?)`              | `await quasar.closeDialog(quasar.dialog(), 'backdrop')`                                                                | Closes with Escape (default) or a backdrop click and waits for the removal. Escape only reaches the top-most modal dialog.                                                                                                                                                                                                               |
| `quasar.menu(options?)`                         | `quasar.menu()` <br /> `quasar.menu({ hasText: 'Item 1' })`                                                            | Locator for the top-most open QMenu. QSelect menus are excluded.                                                                                                                                                                                                                                                                         |
| `quasar.openMenu(trigger, options?)`            | `const menu = await quasar.openMenu(page.getByTestId('open-menu-btn'))`                                                | Clicks the trigger and returns the menu that opened. `{ contextMenu: true }` right-clicks.                                                                                                                                                                                                                                               |
| `quasar.select(target)`                         | `const select = quasar.select(page.getByTestId('select')); await select.pick('Option 1')`                              | Handle for a QSelect: `root`, `combobox`, `open()`, `close()`, `listbox()`, `options()`, `pick(values, { exact, keepOpen })`. The target can be any inner element. `root` is the in-page QSelect; on mobile platforms the open dialog holds a copy of the field, use `open()`/`pick()` rather than asserting on `root` while it is open. |
| `quasar.selectOption(target, values, options?)` | `await quasar.selectOption(page.getByTestId('select'), 'Option 1')` <br /> `await quasar.selectOption(target, [0, 2])` | Shortcut for `select(target).pick(...)`. Strings match option labels exactly, numbers are option indexes. Arrays need a multiple QSelect. Long lists are scrolled.                                                                                                                                                                       |
| `quasar.selectDate(target, value)`              | `await quasar.selectDate(page.getByTestId('date-picker'), '2023/02/23')`                                               | Navigates a QDate through its years and months views and clicks the day. Accepts a `Date`, a string `new Date()` parses, or `{ year, month, day }` as displayed.                                                                                                                                                                         |
| `expect(locator).toHaveColor(color)`            | `await expect(el).toHaveColor('primary')` <br /> `await expect(el).toHaveColor('#fff')`                                | Compares the computed text color. Accepts Quasar color names (`primary`, `red-5`), CSS colors and `var(--q-primary)`. Quasar palette names win over CSS named colors, so `red` means Quasar's Material red, use `#ff0000` for the CSS keyword.                                                                                           |
| `expect(locator).toHaveBackgroundColor(color)`  | `await expect(el).toHaveBackgroundColor('var(--q-positive)')`                                                          | Same for the background color.                                                                                                                                                                                                                                                                                                           |
| `expect(page).toHaveRoute(glob)`                | `await expect(page).toHaveRoute('books/*/pages/*')`                                                                    | Matches the current route with Node's `path.posix.matchesGlob()`. Hash-mode routers are detected, leading `#` and `/` are added for you.                                                                                                                                                                                                 |

Playwright already covers what the Cypress AE needed custom commands for: `getByTestId()` reads `data-testid` (see [Keeping `data-cy` attributes](#keeping-data-cy-attributes) for Cypress suites), and `check()`, `uncheck()` and `toBeChecked()` drive QCheckbox, QToggle and QRadio through their `aria-checked` attribute.

Two Quasar behaviors to know: a closed overlay stays in the DOM for a few hundred milliseconds, so the helpers wait for its removal; and `page.clock.install()` freezes those timers, so tick the clock before waiting on a closed overlay.

> Check out how to use these helpers, and other recipes about testing Quasar UI components, in the [demo suite of the test app](../../test-vite-app-v3/test/playwright/demo), which is what the demo prompt scaffolds.

### GraphQL

The `graphql` fixture answers operations in component tests, calls the API in e2e tests, and reads a single response when the UI shows nothing. Take it from the first argument of the test function, next to `page` or `mount`. It stays inert until a test uses it: a spec that never calls `graphql.mock()` installs no route, so a suite that does not talk GraphQL is unaffected.

Component tests mock the network per operation. The story mounts the component with the app's own client, and the test answers each operation by name through `graphql.mock()`. Loading, empty, error and validation states belong here, where the response is under the test's control.

E2E tests are black-box journeys. The state a journey needs exists before it starts, created through `graphql.execute()` or by a seed script, and the flow itself is driven and asserted through the UI. Ids come from the arrange call, not from a mutation the UI sent.

An e2e test does not wait on an operation after a click. Assert on what the response changed, and Playwright retries the assertion until the data arrives. `graphql.waitForOperation()` is for the read whose screen is identical on purpose, where the server's answer is the only evidence there is.

The Cypress pattern of wrapping every action in the operation it triggers, `cy.withinGraphqlOperation(doc, fn)`, is not ported. It ties the spec to how many requests the implementation sends. A web-first assertion does not. The migration table below maps it.

#### Mock an operation

`graphql.mock(descriptor, response, options?)` answers an operation from the browser side. The descriptor is a codegen document or an operation name. The response is an object with `data`, `errors` or both, or a resolver that receives `{ operationName, variables }` and may be async. `mock()` is asynchronous: await it before the action that triggers the request. An exception thrown inside a resolver fails the test at teardown with that exception, and the request it was answering gets the exception message as a GraphQL error.

```ts
// test/playwright/components/ItemList.spec.ts
import { expect, test } from '../fixtures';
import { CreateItemDocument, ListItemsDocument } from '../graphql/documents';

test('renders the items it receives', async ({ mount, graphql }) => {
  await graphql.mock(ListItemsDocument, {
    data: {
      items: [
        { id: '1', name: 'Alpha' },
        { id: '2', name: 'Beta' },
      ],
    },
  });

  const component = await mount('components/ItemList/Default');

  await expect(component.getByTestId('item')).toHaveText(['Alpha', 'Beta']);
});

test('shows the error the server sent', async ({ mount, graphql }) => {
  await graphql.mock(ListItemsDocument, {
    errors: [{ message: 'Items are unavailable' }],
  });

  const component = await mount('components/ItemList/Default');

  await expect(component.getByTestId('error')).toHaveText(
    'Items are unavailable',
  );
});
```

`mock()` returns a handle. Its `calls` holds the variables of every call it answered, and `waitForCall()` resolves with the variables of the next one, or at once with the last call when one already happened. `waitForCall()` rejects after five seconds, Playwright's default expect timeout, which `{ timeout }` overrides. A higher expect timeout in the config does not raise it, because the runner gives a fixture no access to that value. Assert on those rather than on the request:

```ts
test('sends the name the user typed', async ({ mount, graphql }) => {
  // Once a test mocks one operation, every operation the component sends needs a mock.
  await graphql.mock(ListItemsDocument, { data: { items: [] } });
  const createItem = await graphql.mock(CreateItemDocument, {
    data: { createItem: { id: '1', name: 'Gamma' } },
  });

  const component = await mount('components/ItemList/Default');
  await component.getByTestId('name-input').fill('Gamma');
  await component.getByTestId('create-button').click();

  expect(await createItem.waitForCall()).toEqual({ name: 'Gamma' });
  expect(createItem.calls).toHaveLength(1);
});
```

The last mock registered for a name answers, so a `beforeEach` can register the defaults and a single test can override one of them. `remove()` on the handle unregisters it, and the mock registered before it answers again. `times: 1` unregisters the mock after one answer, which is how a screen that sends the same operation twice gets two different responses. `delay` holds the answer back for that many milliseconds, long enough to assert on a loading state.

Once a test has registered its first mock, every operation it sends needs one. An operation without a mock is answered with `{ errors: [{ message: 'No mock for GraphQL operation "X"' }] }`, and the test fails at teardown with every such name listed. Set `graphqlUnmocked: 'passthrough'` to let them reach the real server instead.

The helpers match a request by the `operationName` field of its JSON body, or by the `operationName` search parameter of a GET request. A request that carries neither is never mocked and falls through to the network, which leaves `calls` empty and reports nothing at teardown. Apollo Client, urql and graphql-request send the field by default.

A batched request, an array body, is answered item by item with an array. Under `graphqlUnmocked: 'passthrough'` a batch goes to the server whole as soon as one of its operations has no mock, the mocked ones included. A GET persisted query is matched on its `operationName` search parameter. Multipart uploads are never mocked and fall through to the network. The scaffolded `components` project sets `serviceWorkers: 'block'`, because a service worker would answer requests before the mock can answer them.

#### Arrange e2e state

`graphql.execute(descriptor, variables?, options?)` calls the API through the page's request context, outside the browser, and returns `data`. It is the arrange step of a journey:

```ts
// test/playwright/e2e/items.spec.ts
import { expect, test } from '../fixtures';
import { CreateItemDocument } from '../graphql/documents';

test('renames an item', async ({ page, graphql }) => {
  const { createItem } = await graphql.execute(CreateItemDocument, {
    name: 'Zeta',
  });

  await page.goto(`/items/${createItem.id}`);
  await page.getByTestId('name-input').fill('Renamed');
  await page.getByTestId('save-button').click();

  await expect(page.getByTestId('name')).toHaveText('Renamed');
});
```

`execute()` sends the query text, so it needs a document. A name alone throws. Headers go in the third argument, `{ headers: { authorization: token } }`, on top of the `graphqlHeaders` option, which the Authentication part below covers. It throws on a non-2xx status, on a body that is not JSON, on a response without `data`, and when `data` has no field for the operation's root selection. When the response carries `errors` it throws `GraphqlExecutionError`, which holds `operationName`, `errors` and the Playwright `response`.

#### Wait for one response

`graphql.waitForOperation(descriptor, options?)` resolves with the browser's response to the next request that carries the operation, as `{ data, errors, response }`. Register it before the action and await it after:

```ts
// test/playwright/e2e/articles.spec.ts
import { expect, test } from '../fixtures';
import { TrackArticleViewDocument } from '../graphql/documents';

test('records the view of an article', async ({ page, graphql }) => {
  await page.goto('/articles/42');

  const viewed = graphql.waitForOperation(TrackArticleViewDocument);
  await page.getByTestId('read-more-button').click();
  const { data, errors } = await viewed;

  expect(errors).toBeUndefined();
  expect(data?.trackArticleView.viewCount).toBe(7);
});
```

It does not throw when the response carries GraphQL errors. The test asserts on `errors` itself. It throws when nothing matches within the timeout, and when the body is not JSON. Reach for it only when the click leaves the screen unchanged: as soon as something on screen moves, assert on that instead.

#### Options

| Option            | Default      | When to set it                                                                                                                                                                                                                                                         |
| ----------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `graphqlEndpoint` | `'/graphql'` | The app posts somewhere else. A pathname matches that path on any origin, an absolute URL matches its origin and path, a `RegExp` is tested against the whole URL, and a function receives the `URL`.                                                                  |
| `graphqlUnmocked` | `'error'`    | Set `'passthrough'` when a spec mocks one operation and lets the others reach the real server. It is consulted only once the test has registered a mock.                                                                                                               |
| `graphqlApiUrl`   | `undefined`  | `execute()` posts here. Without it, an absolute `graphqlEndpoint` is posted to as it is and a pathname is resolved against `baseURL`. Set it when the endpoint is a `RegExp` or a function, which give no URL to post to, or when the API is not behind the `baseURL`. |
| `graphqlHeaders`  | `{}`         | The API needs a header on every `execute()` call, an `authorization` for instance. An app sets it from the fixture that owns its session, see the Authentication part below.                                                                                           |

They are option fixtures: set them for a file or a describe block with `test.use({ graphqlEndpoint: '/api/graphql' })`, or for a whole project in `playwright.config`, whose `defineConfig` then takes `GraphqlOptions` as its first type argument:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import type { GraphqlOptions } from '@quasar/quasar-app-extension-testing-playwright';

// With coverage on, the scaffolded config already has a second type argument:
// defineConfig<GraphqlOptions, QuasarWorkerOptions>
export default defineConfig<GraphqlOptions>({
  // ...
  use: { graphqlEndpoint: '/api/graphql' },
});
```

#### Authentication

The `mock()` and `waitForOperation()` helpers act on the requests the browser sends, which already carry the session. The `execute()` helper sends a request of its own, through the page's request context. Two questions decide what you set up: how your app carries a session, and where a test gets one.

##### Cookie sessions

You don't need to set anything up. The request context shares the cookie jar of the page's context, http-only cookies included. Both a `storageState` file and a login your test performs in the browser apply to `execute()`.

##### Token headers

If your app sends a token, set the `graphqlHeaders` option once, in the fixtures file that every spec imports. Every `execute()` call then carries it:

```ts
// test/playwright/fixtures/index.ts
import { test as quasarTest } from '@quasar/quasar-app-extension-testing-playwright';
import { tokenFor } from './session';

export const test = quasarTest.extend<{ role: 'admin' | 'user' }>({
  // The account a spec acts as. A file or a describe block picks one
  // with test.use({ role: 'admin' }).
  role: ['user', { option: true }],

  graphqlHeaders: async ({ role }, use) => {
    await use({ authorization: `Bearer ${await tokenFor(role)}` });
  },
});
```

The `tokenFor()` function is your own helper. It reads the token from the file the following section writes.

Two options override the headers for a single call:

- To call the API as somebody else, pass `{ headers: { authorization: adminToken } }`. This replaces that one header and keeps the others.
- To call the API anonymously, pass `{ defaultHeaders: false }`. This sends none of the default headers.

##### Log in through the API

This section is about how the tests obtain a session. A login mutation is faster and more stable than launching and filling in the login form, and one login per worker is enough. A worker-scoped fixture has no `page` fixture and no `graphql` fixture, so it opens a page and builds the helpers with `createGraphqlFixture()`.

For a cookie session, the response sets the cookies on the page's context, because `page.request` uses the same cookie jar as that context. Save the context and you have the file:

```ts
await graphql.execute(LogInDocument, { email, password });
await page.context().storageState({ path: file });
```

For a token, write the entry your app reads:

```ts
// test/playwright/fixtures/session.ts
import { writeFileSync } from 'node:fs';
import type { Browser } from '@playwright/test';
import { createGraphqlFixture } from '@quasar/quasar-app-extension-testing-playwright';
import { LogInDocument } from '../graphql/documents';

export async function writeSessionState(
  browser: Browser,
  baseURL: string,
  file: string,
) {
  const page = await browser.newPage({ baseURL });
  const graphql = createGraphqlFixture(page, { baseURL });

  const { logIn } = await graphql.execute(LogInDocument, {
    email: 'user@example.com',
    password: 'secret',
  });

  writeFileSync(
    file,
    JSON.stringify({
      cookies: [],
      origins: [
        {
          // An origin has no trailing slash and no path, a baseURL may have both.
          origin: new URL(baseURL).origin,
          localStorage: [{ name: 'token', value: logIn.token }],
        },
      ],
    }),
  );
  await page.close();
}
```

The cookie path and the token path both write a Playwright storage state. Specs start from one through the `storageState` option, and `tokenFor()` reads the token back out of it. Write the entries the way your app writes them, because your app reads them back. Quasar's `LocalStorage` plugin prefixes its values, `__q_strn|` for a string. Write the prefix into the storage state when your app reads values back through that plugin.

The `createGraphqlFixture()` function takes every `GraphqlOptions` property and `baseURL`, all optional and with the same defaults. It also returns `dispose()`, which removes the route and reports what its mocks recorded. Call it when you are done with the helpers, the way the `graphql` fixture does at the end of each test. The preceding snippet registers no mock and closes its page, so it has nothing to dispose.

The `execute()` helper sends the document as written, so the data holds only the fields the document selects. Apollo Client adds `__typename` to every object it stores, so a user object you store from `execute()` is missing it.

#### Type the operations

A codegen document carries its own types, so `mock()`, `waitForOperation()` and `execute()` infer the response and the variables from it with no cast. Generate the documents into a test-only target, so the test runner loads no app module:

```ts
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'schema.graphql',
  documents: ['test/playwright/graphql/**/*.graphql'],
  generates: {
    'test/playwright/graphql/documents.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: { useTypeImports: true },
    },
  },
};

export default config;
```

Write the output outside `src/`, then git-ignore it and exclude it from linting, like the rest of the generated code.

The other form is the operation name as a string. It reads its types from the `GraphqlOperations` registry, which the app augments:

```ts
// test/playwright/graphql-operations.d.ts
import type {
  ListItemsQuery,
  ListItemsQueryVariables,
} from './graphql/documents';

declare module '@quasar/quasar-app-extension-testing-playwright' {
  interface GraphqlOperations {
    ListItems: { data: ListItemsQuery; variables: ListItemsQueryVariables };
  }
}
```

`graphql.mock('ListItems', { data: { items: [] } })` is then checked the same way the document is. A name the registry does not list still works, the same way an unregistered story id does: it compiles, with `unknown` data and a plain record for the variables. A project that generates its documents can generate this block from the same codegen run.

#### The `graphql` package

`execute()` prints the document with `print` from the `graphql` package, imported on its first call, so the package has to be in the project's devDependencies to use it. `mock()` and `waitForOperation()` read the operation name off the document's AST and need nothing installed, so a project that only mocks never loads it.

#### Not covered

Subscriptions over WebSocket or server-sent events (SSE), multipart uploads, persisted query hashing and client cache helpers such as Apollo's are out of scope. Mock those with `page.route()`, or assert their visible effect.

### Code coverage

Answer "yes" to the coverage prompt when installing the AE. It then:

- instruments the app with `vite-plugin-istanbul` when `QUASAR_TESTING_PLAYWRIGHT=true`;
- collects the coverage from the browser after every test into `.nyc_output/`;
- adds `nyc` and a `test:coverage:report` script, and a `.nycrc` extending the AE preset, which reports as text, html, lcov and json. You can change the reporters in your `.nycrc` if needed.

The collector is off unless `playwright.config` sets it. The install writes `use: { coverage: true }` for you when you answer yes to the prompt, and removing that line turns it off again. It is off by default because the collector opens a browser page for every test, including one that only uses `request`.

Run the tests, then `npm run test:coverage:report`. Delete `.nyc_output/` between runs you do not want merged.

### Linting

If your project uses ESLint, the AE adds `eslint-plugin-playwright` for you. Add into your `eslint.config.js`:

```js
import { defineConfig } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';

export default defineConfig(
  // ...
  {
    name: 'custom/playwright',

    files: ['test/playwright/**/*.{js,jsx,ts,tsx}'],
    extends: [
      // Add Playwright-specific lint rules and globals
      // See https://github.com/playwright-community/eslint-plugin-playwright#rules
      playwright.configs['flat/recommended'],
    ],
  },
  {
    name: 'custom/playwright-imports',

    // The fixtures directory is the one place that imports test and expect from the AE
    files: ['test/playwright/**/*.{js,jsx,ts,tsx}'],
    ignores: ['test/playwright/fixtures/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              importNames: ['test', 'expect'],
              message: 'Import test and expect from test/playwright/fixtures.',
            },
            {
              name: '@quasar/quasar-app-extension-testing-playwright',
              importNames: ['test', 'expect'],
              message: 'Import test and expect from test/playwright/fixtures.',
            },
          ],
        },
      ],
    },
  },
);
```

The rule catches an editor auto-import that picked `@playwright/test`, which has neither the Quasar fixtures nor the matchers.

If your project uses oxlint, its JS plugin layer can run `eslint-plugin-playwright`, see the oxlint documentation on `jsPlugins`.

oxlint lints the scaffolded files out of the box, except that its type check (`options.typeCheck: true`, the create-quasar default) cannot read `.vue` imports and reports `TS2322` on every prop a TSX story passes. Ignore the story files there; `vue-tsc` type-checks them:

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint';

export default defineConfig({
  ignorePatterns: [
    // ...
    // The type check of oxlint runs tsgo, which cannot read .vue imports. So, we disable it here and rely on vue-tsc.
    '**/*.story.tsx',
    '**/*.story.jsx',
  ],
  // ...
});
```

### Custom `publicPath`

If `quasar.config` > `build` > `publicPath` is not `/`, set `appUrl` in `playwright.config` to include it, such as `http://localhost:8080/my-app/`. The e2e `baseURL`, the `webServer.url` and `galleryUrl` derive from `appUrl`, and the gallery is served under the public path too, so nothing else changes.

### Migrating from the Cypress AE

Follow these steps to migrate from the Cypress AE to Playwright:

1. Remove the Cypress AE and its files, see the [Removal section of its README](https://github.com/quasarframework/quasar-testing/tree/dev/packages/e2e-cypress#removal). To reduce code changes to a minimum, you can keep the `data-cy` attributes in your components, see [Keeping `data-cy` attributes](#keeping-data-cy-attributes).
2. Run `quasar ext add @quasar/testing-playwright` and answer the prompts, then install the browsers as shown at the top of this file.
3. Move the e2e specs from `test/cypress/e2e/*.cy.ts` to `test/playwright/e2e/*.spec.ts`, and turn each component spec into a story next to the component plus a spec file under `test/playwright/components/`, using the table below.
4. If you have a CI, replace the `cypress run` steps with `test:e2e:ci` and `test:component:ci`, and add `playwright install --with-deps` before them.

A Cypress component test mounts the component with props. Here the scenario lives in a story, written in TSX or as a `.story.vue` single-file component, and the test mounts it by id.

| Cypress AE                                                                                     | Playwright AE                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cy.dataCy('id')`                                                                              | `page.getByTestId('id')`, with `testIdAttribute` set to `data-cy`, see below                                                                                               |
| `cy.mount(Component, { props })`                                                               | a story export next to the component, `export const Default = () => <Component />;`, mounted with `mount('test/playwright/demo/File/Default')` for the scaffolded examples |
| `installQuasarPlugin()` in the support file                                                    | nothing, the gallery runs your `quasar.config` and boot files                                                                                                              |
| boot files not loaded, add their effects to the support file manually (see "Using boot files") | nothing, boot files run in the gallery as in the app                                                                                                                       |
| `NODE_ENV=test` in scripts                                                                     | `QUASAR_TESTING_PLAYWRIGHT=true`, set by `webServer.env`; the AE doesn't touch `NODE_ENV`                                                                                  |
| `vModelAdapter(ref)`                                                                           | the story holds the ref and passes `modelValue` / `onUpdate:modelValue`, or uses `v-model` in a `.story.vue`                                                               |
| `cy.withinDialog(fn)`                                                                          | `await quasar.withinDialog(fn)`                                                                                                                                            |
| `cy.withinMenu(fn)`                                                                            | `const menu = await quasar.openMenu(trigger)` or `quasar.menu()`                                                                                                           |
| `cy.withinPortal(selector, fn)`                                                                | `page.locator(selector)`, or `quasar.dialog()` and `quasar.menu()` for those portals                                                                                       |
| `cy.withinSelectMenu(fn)`                                                                      | `await quasar.select(target).open()` returns the listbox locator                                                                                                           |
| `cy.get(select).select('Label')`                                                               | `await quasar.selectOption(select, 'Label')`                                                                                                                               |
| `cy.get(checkbox).check()`                                                                     | `await checkbox.check()`                                                                                                                                                   |
| `should('be.checked')`                                                                         | `await expect(checkbox).toBeChecked()`                                                                                                                                     |
| `cy.get(date).selectDate('2023/02/23')`                                                        | `await quasar.selectDate(date, '2023/02/23')`                                                                                                                              |
| `should('have.color', 'white')`                                                                | `await expect(el).toHaveColor('white')`                                                                                                                                    |
| `should('have.backgroundColor', 'red')`                                                        | `await expect(el).toHaveBackgroundColor('red')`                                                                                                                            |
| `cy.testRoute('home')`                                                                         | `await expect(page).toHaveRoute('home')`                                                                                                                                   |
| `cy.session(id, setupFn)`                                                                      | a setup project that logs in once and saves `storageState`, or the lazy `role` fixture, see Authentication above                                                           |
| `cy.withinGraphqlOperation(doc, fn)`                                                           | the action, then a web-first assertion on what the response changed                                                                                                        |
| `cy.waitGraphql(doc)` for a read the UI does not show                                          | `graphql.waitForOperation(doc)`, registered before the action                                                                                                              |
| `cy.intercept` with a stubbed GraphQL body                                                     | `await graphql.mock(doc, { data })`                                                                                                                                        |
| UI-driven setup utilities                                                                      | `await graphql.execute(doc, variables)` before the flow                                                                                                                    |
| `test:e2e`, `test:component` scripts                                                           | same names. Installing both AEs overwrites them with the last one installed.                                                                                               |
| `quasarComponentTestingConfig()` in `cypress.config`                                           | the `components` project of the scaffolded `playwright.config`                                                                                                             |

#### Keeping `data-cy` attributes

`getByTestId()` reads `data-testid`. To keep the `data-cy` attributes of a Cypress suite, set the attribute in `playwright.config`. Playwright 1.61 and newer accept a list, so both work side by side during a migration:

```ts
use: {
  testIdAttribute: 'data-cy,data-testid',
},
```

### Removal

```shell
$ quasar ext remove @quasar/testing-playwright
```

This only uninstalls and unregisters the AE. For a full cleanup including Playwright itself, also do:

- delete `playwright.config.[ts|js]`, `test/playwright/fixtures/`, `test/playwright/e2e/`, `test/playwright/components/`, `test/playwright/demo/`, `.nycrc`, `.github/workflows/playwright.yml` and the `*.story.*` files you no longer need
- remove the `test`, `test:e2e`, `test:e2e:ci`, `test:component`, `test:component:ci`, `test:report` and `test:coverage:report` scripts from `package.json`
- remove `@playwright/test`, `nyc` and `eslint-plugin-playwright` devDependencies from `package.json`
- remove `test-results/`, `playwright-report/`, `blob-report/`, `.nyc_output` and `coverage/` lines from `.gitignore`
