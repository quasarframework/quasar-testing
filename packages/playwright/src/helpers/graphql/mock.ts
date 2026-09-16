import {
  readOperations,
  type OperationCall,
  type RequestLike,
} from './request-body';
import type { GraphqlError } from './response';

export interface MockResponse<TData> {
  data?: TData | null;
  errors?: GraphqlError[];
}

export type MockResolver<TData, TVariables> = (call: {
  operationName: string;
  variables: TVariables;
}) => MockResponse<TData> | Promise<MockResponse<TData>>;

export interface MockOptions {
  /** Milliseconds to wait before answering. */
  delay?: number;
  /** The mock answers this many calls, then it is removed. */
  times?: number;
}

export interface MockHandle<TVariables> {
  /** The variables of every call the mock received, in order. */
  readonly calls: readonly TVariables[];
  /** The variables of the next call. Resolves at once with the last call when one already happened. */
  waitForCall(options?: { timeout?: number }): Promise<TVariables>;
  /** Unregisters the mock. An earlier mock of the same operation answers again. */
  remove(): void;
}

export type UnmockedPolicy = 'error' | 'passthrough';

/**
 * The part of a Playwright Page the registry uses. A test passes a literal.
 * Both methods resolve with a value the registry ignores. page.route() resolves
 * with a Disposable.
 */
interface RoutablePage {
  route(
    url: (url: URL) => boolean,
    handler: (route: RouteLike) => Promise<void>,
  ): Promise<unknown>;
  unroute(
    url: (url: URL) => boolean,
    handler: (route: RouteLike) => Promise<void>,
  ): Promise<unknown>;
}

/** The part of a Playwright Route the handler uses. A test passes a literal. */
interface RouteLike {
  request(): RequestLike;
  fulfill(options: { json: unknown }): Promise<void>;
  fallback(): Promise<void>;
}

interface MockRegistryOptions {
  matchesEndpoint: (url: URL) => boolean;
  unmocked: UnmockedPolicy;
  /** The default of waitForCall(). The fixture passes Playwright's default expect timeout. */
  defaultTimeout: number;
}

interface MockRegistry {
  mock(
    operationName: string,
    response:
      | MockResponse<unknown>
      | MockResolver<unknown, Record<string, unknown>>,
    options?: MockOptions,
  ): Promise<MockHandle<Record<string, unknown>>>;
  /** Removes the route, then throws a recorded resolver exception, then the unmocked names. */
  dispose(): Promise<void>;
}

interface MockEntry {
  operationName: string;
  response:
    | MockResponse<unknown>
    | MockResolver<unknown, Record<string, unknown>>;
  delay: number | undefined;
  times: number | undefined;
  answered: number;
  calls: Record<string, unknown>[];
  waiters: ((variables: Record<string, unknown>) => void)[];
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function sleep(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

function unmockedAnswer(operationName: string): MockResponse<unknown> {
  return {
    errors: [{ message: `No mock for GraphQL operation "${operationName}"` }],
  };
}

export function createMockRegistry(
  page: RoutablePage,
  options: MockRegistryOptions,
): MockRegistry {
  const entries = new Map<string, MockEntry[]>();
  const unmockedNames = new Set<string>();
  const resolverErrors: unknown[] = [];
  /** The timers of the waitForCall() calls still waiting. dispose() clears them. */
  const waitTimers = new Set<ReturnType<typeof setTimeout>>();
  let routeInstallation: Promise<unknown> | undefined;

  function activeEntry(operationName: string) {
    return entries.get(operationName)?.at(-1);
  }

  function removeEntry(entry: MockEntry) {
    const entriesForOperation = entries.get(entry.operationName);
    if (entriesForOperation === undefined) {
      return;
    }

    const index = entriesForOperation.indexOf(entry);
    if (index !== -1) {
      entriesForOperation.splice(index, 1);
    }

    if (entriesForOperation.length === 0) {
      entries.delete(entry.operationName);
    }
  }

  /** Runs the response of an entry. A resolver exception is kept for dispose(). */
  async function evaluate(
    entry: MockEntry,
    call: OperationCall,
  ): Promise<MockResponse<unknown>> {
    if (typeof entry.response !== 'function') {
      return entry.response;
    }

    try {
      return await entry.response({
        operationName: call.operationName,
        variables: call.variables,
      });
    } catch (error) {
      resolverErrors.push(error);
      return { errors: [{ message: errorMessage(error) }] };
    }
  }

  async function answer(
    entry: MockEntry,
    call: OperationCall,
  ): Promise<MockResponse<unknown>> {
    entry.calls.push(call.variables);
    entry.answered += 1;

    if (entry.times !== undefined && entry.answered >= entry.times) {
      removeEntry(entry);
    }

    for (const waiter of entry.waiters.splice(0)) {
      waiter(call.variables);
    }

    if (entry.delay !== undefined) {
      await sleep(entry.delay);
    }

    return evaluate(entry, call);
  }

  function waitForCall(entry: MockEntry, timeout: number) {
    const lastCall = entry.calls.at(-1);
    if (lastCall !== undefined) {
      return Promise.resolve(lastCall);
    }

    const pending = new Promise<Record<string, unknown>>((resolve, reject) => {
      const waiter = (variables: Record<string, unknown>) => {
        clearTimeout(timer);
        waitTimers.delete(timer);
        resolve(variables);
      };

      const timer = setTimeout(() => {
        waitTimers.delete(timer);

        const index = entry.waiters.indexOf(waiter);
        if (index !== -1) {
          entry.waiters.splice(index, 1);
        }

        reject(
          new Error(
            `No call to GraphQL operation "${entry.operationName}" within ${timeout}ms.`,
          ),
        );
      }, timeout);

      waitTimers.add(timer);
      entry.waiters.push(waiter);
    });

    // The timeout callback can reject this promise before the caller attaches its
    // handler. The no-op handler below stops Node from reporting that rejection.
    pending.catch(() => undefined);

    return pending;
  }

  async function handleRoute(route: RouteLike) {
    const parsed = readOperations(route.request());
    if (parsed === undefined) {
      await route.fallback();
      return;
    }

    const matched = parsed.operations.map((call) => ({
      call,
      entry: activeEntry(call.operationName),
    }));

    const hasUnmocked = matched.some(({ entry }) => entry === undefined);
    if (hasUnmocked && options.unmocked === 'passthrough') {
      await route.fallback();
      return;
    }

    const answers = await Promise.all(
      matched.map(async ({ call, entry }) => {
        if (entry === undefined) {
          unmockedNames.add(call.operationName);
          return unmockedAnswer(call.operationName);
        }

        return answer(entry, call);
      }),
    );

    await route.fulfill({ json: parsed.isBatched ? answers : answers[0] });
  }

  return {
    async mock(operationName, response, mockOptions = {}) {
      routeInstallation ??= page.route(options.matchesEndpoint, handleRoute);
      await routeInstallation;

      const entry: MockEntry = {
        operationName,
        response,
        delay: mockOptions.delay,
        times: mockOptions.times,
        answered: 0,
        calls: [],
        waiters: [],
      };

      const entriesForOperation = entries.get(operationName) ?? [];
      entriesForOperation.push(entry);
      entries.set(operationName, entriesForOperation);

      return {
        get calls() {
          return entry.calls;
        },
        waitForCall(waitOptions) {
          return waitForCall(
            entry,
            waitOptions?.timeout ?? options.defaultTimeout,
          );
        },
        remove() {
          removeEntry(entry);
        },
      };
    },

    async dispose() {
      for (const timer of waitTimers) {
        clearTimeout(timer);
      }
      waitTimers.clear();

      if (routeInstallation !== undefined) {
        await page.unroute(options.matchesEndpoint, handleRoute);
      }

      if (resolverErrors.length > 0) {
        throw resolverErrors[0];
      }

      if (unmockedNames.size > 0) {
        throw new Error(
          `GraphQL operations without a mock: ${[...unmockedNames].sort().join(', ')}. Register them with graphql.mock() or set the graphqlUnmocked option to "passthrough".`,
        );
      }
    },
  };
}
