/*
  Validation of the @quasar/app-vite internals the gallery boots through, and
  the boot file runner. The gallery runs boot files the way app-vite's client
  entry does, from templates/entry/client-entry.js. This module stays free of
  vue, quasar and #q-app imports, so the test suite can run it under node.

  TODO: consider adding some mechanism to app-vite to re-use the app factory, boot files, etc. logic better
*/

import { APP_VITE_SUPPORT_NOTE, GALLERY_FLAG } from '../shared';

/** A module the generated gallery entry imports, and the path it imports it from. */
export interface ModuleReference {
  path: string;
  load: () => Promise<unknown>;
}

export interface BootContext {
  app: unknown;
  router: unknown;
  store?: unknown;
  urlPath: string;
  publicPath: string;
}

/** The object a boot file receives. Same keys as in @quasar/app-vite's client entry. */
export interface BootFileParams extends BootContext {
  ssrContext: null;
  redirect: (url: unknown) => never;
}

/** The default export of app-vite's generated app.js, validated by validateAppFactory(). */
export type AppFactory = (
  createAppFn: (rootComponent: unknown) => unknown,
  quasarUserOptions: unknown,
) => Promise<{ app: unknown; router: unknown; store?: unknown }>;

/** The Vue app the factory returns. Typed by its methods, so this module does not import vue. */
export interface AppLike {
  use(plugin: unknown, ...options: unknown[]): unknown;
  mount(selector: string): unknown;
  unmount(): void;
}

/** The vue-router instance the factory returns. */
export interface RouterLike {
  push(to: unknown): unknown;
}

export class GalleryRedirectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GalleryRedirectError';
  }
}

type BootFunction = (params: BootFileParams) => unknown;

type LoadedBootFile =
  | { path: string; module: unknown }
  | { path: string; error: unknown };

const APP_METHODS = ['use', 'mount', 'unmount'] as const;
const ROUTER_METHODS = ['push'] as const;

function describeType(value: unknown) {
  return value === null ? 'null' : typeof value;
}

function describeKeys(value: unknown) {
  if (typeof value !== 'object' || value === null) {
    return describeType(value);
  }

  const keys = Object.keys(value);
  return keys.length === 0 ? 'no keys' : keys.join(', ');
}

function readDefaultExport(module: unknown): unknown {
  if (typeof module !== 'object' || module === null) {
    return undefined;
  }

  return (module as { default?: unknown }).default;
}

function hasMethods(value: unknown, methods: readonly string[]) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return methods.every((method) => typeof candidate[method] === 'function');
}

export function validateAppFactory(
  module: unknown,
  webPath: string,
): AppFactory {
  const defaultExport = readDefaultExport(module);
  if (typeof defaultExport !== 'function') {
    throw new Error(
      `Expected ${webPath} to export a function as default, the app factory of @quasar/app-vite. Got ${describeType(defaultExport)}. ${APP_VITE_SUPPORT_NOTE}`,
    );
  }

  return defaultExport as AppFactory;
}

export function validateQuasarUserOptions(
  module: unknown,
  webPath: string,
): object {
  const defaultExport = readDefaultExport(module);
  if (typeof defaultExport !== 'object' || defaultExport === null) {
    throw new Error(
      `Expected ${webPath} to export an object as default, the Quasar options of @quasar/app-vite. Got ${describeType(defaultExport)}. ${APP_VITE_SUPPORT_NOTE}`,
    );
  }

  return defaultExport;
}

export function validateAppFactoryResult(
  result: unknown,
  webPath: string,
): { app: AppLike; router: RouterLike; store?: unknown } {
  const { app, router, store } = (result ?? {}) as {
    app?: unknown;
    router?: unknown;
    store?: unknown;
  };

  if (!hasMethods(app, APP_METHODS) || !hasMethods(router, ROUTER_METHODS)) {
    throw new Error(
      `Expected the app factory of @quasar/app-vite (${webPath}) to resolve to { app, router }. Got ${describeKeys(result)}. ${APP_VITE_SUPPORT_NOTE}`,
    );
  }

  return { app: app as AppLike, router: router as RouterLike, store };
}

function createRedirect(path: string) {
  return (url: unknown): never => {
    const target = typeof url === 'string' ? url : JSON.stringify(url);
    throw new GalleryRedirectError(
      `Boot file "${path}" redirected the gallery to "${target}". Skip that logic when globalThis.${GALLERY_FLAG} is set.`,
    );
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Loads one of the files @quasar/app-vite generates. A renamed entry directory
 * or a removed file reaches the test as a browser fetch error. The message
 * names the file and what it holds.
 */
export async function loadModuleReference(
  reference: ModuleReference,
  description: string,
): Promise<unknown> {
  try {
    return await reference.load();
  } catch (error) {
    throw new Error(
      `Could not load ${reference.path}, ${description} of @quasar/app-vite: ${errorMessage(error)}. ${APP_VITE_SUPPORT_NOTE}`,
      { cause: error },
    );
  }
}

/**
 * Loads every boot module, keeps the default exports that are functions the way
 * app-vite does, then runs them in order until one redirects or throws.
 */
export async function runBootFiles(
  bootFiles: readonly ModuleReference[],
  context: BootContext,
): Promise<void> {
  const loaded = await Promise.all(
    bootFiles.map(async ({ path, load }): Promise<LoadedBootFile> => {
      try {
        return { path, module: await load() };
      } catch (error) {
        return { path, error };
      }
    }),
  );

  const bootFunctions: Array<{ path: string; run: BootFunction }> = [];

  for (const bootFile of loaded) {
    if ('error' in bootFile) {
      throw new Error(
        `Boot file "${bootFile.path}" failed to load: ${errorMessage(bootFile.error)}`,
        { cause: bootFile.error },
      );
    }

    const defaultExport = readDefaultExport(bootFile.module);
    if (typeof defaultExport === 'function') {
      bootFunctions.push({
        path: bootFile.path,
        run: defaultExport as BootFunction,
      });
    }
  }

  // app-vite passes no store key at all when the app has no store.
  const { store, ...bootContext } = context;
  const sharedParams = {
    ...bootContext,
    ...(store === undefined ? {} : { store }),
    ssrContext: null,
  };

  for (const { path, run } of bootFunctions) {
    try {
      await run({ ...sharedParams, redirect: createRedirect(path) });
    } catch (error) {
      if (error instanceof GalleryRedirectError) {
        throw error;
      }

      throw new Error(`Boot file "${path}" threw: ${errorMessage(error)}`, {
        cause: error,
      });
    }
  }
}
