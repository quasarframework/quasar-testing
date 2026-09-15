import { expect, test } from 'vitest';
import { APP_VITE_SUPPORT_NOTE } from '../shared';
import {
  loadModuleReference,
  runBootFiles,
  validateAppFactory,
  validateAppFactoryResult,
  validateQuasarUserOptions,
  GalleryRedirectError,
  type BootContext,
  type BootFileParams,
  type ModuleReference,
} from './boot';

const APP_JS_PATH = '/.quasar/dev-spa/app.js';
const QUASAR_USER_OPTIONS_PATH = '/.quasar/dev-spa/quasar-user-options.js';

const contextWithoutStore: BootContext = {
  app: { id: 'app' },
  router: { id: 'router' },
  urlPath: '/playwright/gallery/index.html',
  publicPath: '/',
};
const store = { id: 'store' };
const context: BootContext = { ...contextWithoutStore, store };

const appLike = {
  use() {},
  mount() {},
  unmount() {},
};
const routerLike = { push() {} };

function bootFile(path: string, module: unknown): ModuleReference {
  return { path, load: () => Promise.resolve(module) };
}

function unloadableBootFile(path: string, error: Error): ModuleReference {
  return { path, load: () => Promise.reject(error) };
}

test('runs the boot functions in order', async () => {
  const calls: string[] = [];

  await runBootFiles(
    [
      bootFile('@/boot/first', { default: () => calls.push('first') }),
      bootFile('@/boot/second', {
        default: async () => {
          await Promise.resolve();
          calls.push('second');
        },
      }),
      bootFile('@/boot/third', { default: () => calls.push('third') }),
    ],
    context,
  );

  expect(calls).toStrictEqual(['first', 'second', 'third']);
});

test('skips a module whose default export is not a function', async () => {
  const calls: string[] = [];

  await runBootFiles(
    [
      bootFile('@/boot/constant', { default: 'not a function' }),
      bootFile('@/boot/named', { named: () => calls.push('named') }),
      bootFile('@/boot/i18n', { default: () => calls.push('i18n') }),
    ],
    context,
  );

  expect(calls).toStrictEqual(['i18n']);
});

test('passes the app-vite boot signature', async () => {
  let received: BootFileParams | undefined;

  await runBootFiles(
    [
      bootFile('@/boot/params', {
        default: (params: BootFileParams) => {
          received = params;
        },
      }),
    ],
    context,
  );

  if (received === undefined) {
    throw new Error('The boot file did not run');
  }

  expect(received.app).toBe(context.app);
  expect(received.router).toBe(context.router);
  expect(received.store).toBe(store);
  expect(received.urlPath).toBe(context.urlPath);
  expect(received.publicPath).toBe(context.publicPath);
  expect(received.ssrContext).toBe(null);
  expect(typeof received.redirect).toBe('function');
});

test('omits the store key when the app has no store', async () => {
  let received: BootFileParams | undefined;

  await runBootFiles(
    [
      bootFile('@/boot/params', {
        default: (params: BootFileParams) => {
          received = params;
        },
      }),
    ],
    contextWithoutStore,
  );

  if (received === undefined) {
    throw new Error('The boot file did not run');
  }

  expect('store' in received).toBe(false);
});

test('throws with the path when a boot module fails to load', async () => {
  const calls: string[] = [];

  await expect(
    runBootFiles(
      [
        bootFile('@/boot/i18n', { default: () => calls.push('i18n') }),
        unloadableBootFile(
          '@/boot/apollo',
          new Error('Failed to fetch dynamically imported module'),
        ),
      ],
      context,
    ),
  ).rejects.toThrow(
    new Error(
      'Boot file "@/boot/apollo" failed to load: Failed to fetch dynamically imported module',
    ),
  );

  expect(calls).toStrictEqual([]);
});

test('wraps an error thrown by a boot function and skips the rest', async () => {
  const cause = new Error('missing API key');
  const calls: string[] = [];

  await expect(
    runBootFiles(
      [
        bootFile('@/boot/i18n', { default: () => calls.push('i18n') }),
        bootFile('@/boot/apollo', {
          default: () => {
            throw cause;
          },
        }),
        bootFile('@/boot/axios', { default: () => calls.push('axios') }),
      ],
      context,
    ),
  ).rejects.toThrow(
    new Error('Boot file "@/boot/apollo" threw: missing API key'),
  );

  expect(calls).toStrictEqual(['i18n']);
});

test('wraps a boot function whose promise rejects', async () => {
  const cause = new Error('the token request failed');

  await expect(
    runBootFiles(
      [
        bootFile('@/boot/auth', {
          default: async () => {
            await Promise.resolve();
            throw cause;
          },
        }),
      ],
      context,
    ),
  ).rejects.toThrow(
    new Error('Boot file "@/boot/auth" threw: the token request failed'),
  );
});

test('stops at a redirect and points at the gallery flag', async () => {
  const calls: string[] = [];

  await expect(
    runBootFiles(
      [
        bootFile('@/boot/auth', {
          default: ({ redirect }: BootFileParams) => {
            calls.push('auth');
            redirect('/login');
          },
        }),
        bootFile('@/boot/i18n', { default: () => calls.push('i18n') }),
      ],
      context,
    ),
  ).rejects.toThrow(
    new GalleryRedirectError(
      'Boot file "@/boot/auth" redirected the gallery to "/login". Skip that logic when globalThis.__QUASAR_PLAYWRIGHT_GALLERY__ is set.',
    ),
  );

  expect(calls).toStrictEqual(['auth']);
});

test('reports a route object redirect as JSON', async () => {
  await expect(
    runBootFiles(
      [
        bootFile('@/boot/auth', {
          default: ({ redirect }: BootFileParams) => {
            redirect({ name: 'login' });
          },
        }),
      ],
      context,
    ),
  ).rejects.toThrow(
    new GalleryRedirectError(
      'Boot file "@/boot/auth" redirected the gallery to "{"name":"login"}". Skip that logic when globalThis.__QUASAR_PLAYWRIGHT_GALLERY__ is set.',
    ),
  );
});

test('validateAppFactory returns the default export', () => {
  const factory = () => Promise.resolve({ app: appLike, router: routerLike });

  expect(validateAppFactory({ default: factory }, APP_JS_PATH)).toBe(factory);
});

test('validateAppFactory rejects a module without a function default', () => {
  const cases: ReadonlyArray<[unknown, string]> = [
    [undefined, 'undefined'],
    [{}, 'undefined'],
    [{ default: {} }, 'object'],
    [{ default: null }, 'null'],
  ];

  for (const [module, type] of cases) {
    expect(() => validateAppFactory(module, APP_JS_PATH)).toThrow(
      new Error(
        `Expected ${APP_JS_PATH} to export a function as default, the app factory of @quasar/app-vite. Got ${type}. ${APP_VITE_SUPPORT_NOTE}`,
      ),
    );
  }
});

test('validateQuasarUserOptions returns the default export', () => {
  const quasarUserOptions = { config: {}, plugins: {} };

  expect(
    validateQuasarUserOptions(
      { default: quasarUserOptions },
      QUASAR_USER_OPTIONS_PATH,
    ),
  ).toBe(quasarUserOptions);
});

test('validateQuasarUserOptions rejects a module without an object default', () => {
  const cases: ReadonlyArray<[unknown, string]> = [
    [undefined, 'undefined'],
    [{}, 'undefined'],
    [{ default: 'nope' }, 'string'],
    [{ default: null }, 'null'],
  ];

  for (const [module, type] of cases) {
    expect(() =>
      validateQuasarUserOptions(module, QUASAR_USER_OPTIONS_PATH),
    ).toThrow(
      new Error(
        `Expected ${QUASAR_USER_OPTIONS_PATH} to export an object as default, the Quasar options of @quasar/app-vite. Got ${type}. ${APP_VITE_SUPPORT_NOTE}`,
      ),
    );
  }
});

test('validateAppFactoryResult returns the app, the router and the store', () => {
  const result = validateAppFactoryResult(
    { app: appLike, router: routerLike, store },
    APP_JS_PATH,
  );

  expect(result.app).toBe(appLike);
  expect(result.router).toBe(routerLike);
  expect(result.store).toBe(store);
});

test('validateAppFactoryResult rejects a result without an app and a router', () => {
  const cases: ReadonlyArray<[unknown, string]> = [
    [undefined, 'undefined'],
    [{}, 'no keys'],
    [{ app: appLike }, 'app'],
    [{ app: {}, router: routerLike }, 'app, router'],
    [{ app: appLike, router: {} }, 'app, router'],
  ];

  for (const [result, keys] of cases) {
    expect(() => validateAppFactoryResult(result, APP_JS_PATH)).toThrow(
      new Error(
        `Expected the app factory of @quasar/app-vite (${APP_JS_PATH}) to resolve to { app, router }. Got ${keys}. ${APP_VITE_SUPPORT_NOTE}`,
      ),
    );
  }
});

test('names the file and the reason when an app-vite module fails to load', async () => {
  const cause = new Error('Failed to fetch dynamically imported module');

  await expect(
    loadModuleReference(
      {
        path: APP_JS_PATH,
        load: () => Promise.reject(cause),
      },
      'the app factory',
    ),
  ).rejects.toThrow(
    new Error(
      `Could not load ${APP_JS_PATH}, the app factory of @quasar/app-vite: Failed to fetch dynamically imported module. ${APP_VITE_SUPPORT_NOTE}`,
    ),
  );
});

test('passes the module through when the load resolves', async () => {
  const module = { default: () => undefined };

  expect(
    await loadModuleReference(
      { path: APP_JS_PATH, load: () => Promise.resolve(module) },
      'the app factory',
    ),
  ).toBe(module);
});
