import { test as base, type Page } from '@playwright/test';
import {
  resolveOperation,
  type DataOf,
  type OperationDescriptor,
  type OperationDocument,
  type OperationName,
  type VariablesOf,
} from '../graphql/document';
import {
  createEndpointMatcher,
  resolveApiUrl,
  type GraphqlEndpoint,
} from '../graphql/endpoint';
import {
  execute,
  printWithGraphql,
  type ExecuteOptions,
} from '../graphql/execute';
import {
  createMockRegistry,
  type MockHandle,
  type MockOptions,
  type MockResolver,
  type MockResponse,
  type UnmockedPolicy,
} from '../graphql/mock';
import {
  waitForOperation,
  type OperationResponse,
  type WaitForOperationOptions,
} from '../graphql/wait';

// The default of mockHandle.waitForCall(). This is Playwright's own default
// expect timeout. The runner gives a fixture no access to the configured one.
const DEFAULT_EXPECT_TIMEOUT = 5000;

const DEFAULT_ENDPOINT = '/graphql';
const DEFAULT_UNMOCKED: UnmockedPolicy = 'error';
// Nothing mutates it. execute() merges it into the headers of every call.
const DEFAULT_HEADERS: Record<string, string> = {};

export interface GraphqlOptions {
  /** Where the app sends GraphQL requests. A pathname, an absolute URL, a RegExp tested on the href, or a predicate. */
  graphqlEndpoint: GraphqlEndpoint;
  /** What an operation without a mock gets, once a test has registered a mock. */
  graphqlUnmocked: UnmockedPolicy;
  /** The absolute URL execute() posts to. Needed when the endpoint is a RegExp or a function, or when the API is not behind the baseURL. */
  graphqlApiUrl: string | undefined;
  /**
   * The headers execute() sends on every call. An app overrides this option
   * with a fixture that reads its session:
   * `graphqlHeaders: async ({ role, sessions }, use) => use({ authorization: await sessions.authorizationFor(role) })`.
   */
  graphqlHeaders: Record<string, string>;
}

export interface GraphqlFixture {
  /** Answers the operation from the browser side. The last mock registered for a name answers. */
  mock<TData, TVariables>(
    document: OperationDocument<TData, TVariables>,
    response: MockResponse<TData> | MockResolver<TData, TVariables>,
    options?: MockOptions,
  ): Promise<MockHandle<TVariables>>;
  mock<N extends OperationName>(
    name: N,
    response: MockResponse<DataOf<N>> | MockResolver<DataOf<N>, VariablesOf<N>>,
    options?: MockOptions,
  ): Promise<MockHandle<VariablesOf<N>>>;
  /** Resolves with the response to the next request that carries the operation. Register it before the action, await it after. */
  waitForOperation<TData, TVariables>(
    document: OperationDocument<TData, TVariables>,
    options?: WaitForOperationOptions,
  ): Promise<OperationResponse<TData>>;
  waitForOperation<N extends OperationName>(
    name: N,
    options?: WaitForOperationOptions,
  ): Promise<OperationResponse<DataOf<N>>>;
  /** Calls the API through the page's request context and returns the data. Needs a document and the graphql package. */
  execute<TData, TVariables>(
    document: OperationDocument<TData, TVariables>,
    variables?: TVariables,
    options?: ExecuteOptions,
  ): Promise<TData>;
  execute<N extends OperationName>(
    name: N,
    variables?: VariablesOf<N>,
    options?: ExecuteOptions,
  ): Promise<DataOf<N>>;
}

/** Everything the helpers read, with every default already applied. */
interface ResolvedGraphqlOptions extends GraphqlOptions {
  baseURL: string | undefined;
}

/** Builds the helpers and the teardown the graphql fixture runs after use(). */
function createGraphqlHelpers(
  page: Page,
  options: ResolvedGraphqlOptions,
): { fixture: GraphqlFixture; dispose: () => Promise<void> } {
  const {
    graphqlEndpoint,
    graphqlUnmocked,
    graphqlApiUrl,
    graphqlHeaders,
    baseURL,
  } = options;

  const matchesEndpoint = createEndpointMatcher(graphqlEndpoint);
  const mocks = createMockRegistry(page, {
    matchesEndpoint,
    unmocked: graphqlUnmocked,
    defaultTimeout: DEFAULT_EXPECT_TIMEOUT,
  });

  // The overloads on GraphqlFixture type the descriptor. The implementations take any descriptor.
  const fixture = {
    mock: (
      descriptor: OperationDescriptor,
      response:
        | MockResponse<unknown>
        | MockResolver<unknown, Record<string, unknown>>,
      options?: MockOptions,
    ) => mocks.mock(resolveOperation(descriptor).name, response, options),
    waitForOperation: (
      descriptor: OperationDescriptor,
      options?: WaitForOperationOptions,
    ) =>
      waitForOperation(
        page,
        matchesEndpoint,
        resolveOperation(descriptor).name,
        options,
      ),
    execute: (
      descriptor: OperationDescriptor,
      variables?: Record<string, unknown>,
      options?: ExecuteOptions,
    ) =>
      execute(
        {
          // page.request carries the cookies of the page's context.
          post: (url, data, headers) =>
            page.request.post(url, {
              data,
              ...(headers === undefined ? {} : { headers }),
            }),
          resolveUrl: () =>
            resolveApiUrl(graphqlEndpoint, graphqlApiUrl, baseURL),
          defaultHeaders: graphqlHeaders,
          printDocument: printWithGraphql,
        },
        descriptor,
        variables,
        options,
      ),
  } as GraphqlFixture;

  return { fixture, dispose: () => mocks.dispose() };
}

/**
 * The helpers the `graphql` fixture yields, bound to the given page. Build them
 * for a page the fixture does not cover: a popup, or a page a worker fixture
 * opens to log in through the API. Call dispose() at the end of the test: it
 * removes the route and reports the resolver exceptions and the unmocked
 * operations the mocks recorded.
 */
export function createGraphqlFixture(
  page: Page,
  options: Partial<GraphqlOptions> & { baseURL?: string | undefined } = {},
): GraphqlFixture & { dispose(): Promise<void> } {
  const { fixture, dispose } = createGraphqlHelpers(page, {
    graphqlEndpoint: options.graphqlEndpoint ?? DEFAULT_ENDPOINT,
    graphqlUnmocked: options.graphqlUnmocked ?? DEFAULT_UNMOCKED,
    graphqlApiUrl: options.graphqlApiUrl,
    graphqlHeaders: options.graphqlHeaders ?? DEFAULT_HEADERS,
    baseURL: options.baseURL,
  });

  return { ...fixture, dispose };
}

export const graphqlTest = base.extend<
  GraphqlOptions & { graphql: GraphqlFixture }
>({
  graphqlEndpoint: [DEFAULT_ENDPOINT, { option: true }],
  graphqlUnmocked: [DEFAULT_UNMOCKED, { option: true }],
  graphqlApiUrl: [undefined, { option: true }],
  graphqlHeaders: [DEFAULT_HEADERS, { option: true }],

  graphql: async (
    {
      page,
      baseURL,
      graphqlEndpoint,
      graphqlUnmocked,
      graphqlApiUrl,
      graphqlHeaders,
    },
    use,
  ) => {
    const { fixture, dispose } = createGraphqlHelpers(page, {
      graphqlEndpoint,
      graphqlUnmocked,
      graphqlApiUrl,
      graphqlHeaders,
      baseURL,
    });

    await use(fixture);

    // The components project reuses one browser context, so the page survives
    // the test. The route registered on it must not.
    await dispose();
  },
});
