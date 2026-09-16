import { afterEach, expect, test, vi } from 'vitest';
import { createMockRegistry } from './mock';

type Page = Parameters<typeof createMockRegistry>[0];
type Handler = Parameters<Page['route']>[1];
type Route = Parameters<Handler>[0];

function createFakePage() {
  const routed: Handler[] = [];
  const unrouted: Handler[] = [];

  const page: Page = {
    route: (_url, handler) => {
      routed.push(handler);
      return Promise.resolve();
    },
    unroute: (_url, handler) => {
      unrouted.push(handler);
      return Promise.resolve();
    },
  };

  return { page, routed, unrouted };
}

function createFakeRoute(
  body: unknown,
  options: { method?: string; contentType?: string } = {},
) {
  const fulfilled: unknown[] = [];
  let fellBack = false;
  const method = options.method ?? 'POST';
  const isGet = method === 'GET';

  const route: Route = {
    request: () => ({
      method: () => method,
      url: () =>
        isGet
          ? `http://localhost:8080/graphql${String(body)}`
          : 'http://localhost:8080/graphql',
      headers: () => ({
        'content-type': options.contentType ?? 'application/json',
      }),
      postData: () => (isGet ? null : JSON.stringify(body)),
    }),
    fulfill: ({ json }) => {
      fulfilled.push(json);
      return Promise.resolve();
    },
    fallback: () => {
      fellBack = true;
      return Promise.resolve();
    },
  };

  return { route, fulfilled, fellBack: () => fellBack };
}

const matchesEndpoint = (url: URL) => url.pathname === '/graphql';

function createRegistry(unmocked: 'error' | 'passthrough' = 'error') {
  const fake = createFakePage();
  const registry = createMockRegistry(fake.page, {
    matchesEndpoint,
    unmocked,
    defaultTimeout: 1000,
  });

  return { ...fake, registry, handler: () => fake.routed[0] };
}

afterEach(() => {
  vi.useRealTimers();
});

test('the first mock installs one route and dispose removes it', async () => {
  const { registry, routed, unrouted } = createRegistry();

  await registry.mock('ListItems', { data: { items: [] } });
  await registry.mock('ItemCount', { data: { itemCount: 0 } });
  expect(routed).toHaveLength(1);

  await registry.dispose();
  expect(unrouted).toEqual(routed);
});

test('dispose without a mock installs and removes nothing', async () => {
  const { registry, routed, unrouted } = createRegistry();

  await registry.dispose();

  expect(routed).toEqual([]);
  expect(unrouted).toEqual([]);
});

test('answers with the response and records the variables', async () => {
  const { registry, handler } = createRegistry();
  const handle = await registry.mock('ListItems', {
    data: { items: [{ id: '1' }] },
  });
  const { route, fulfilled } = createFakeRoute({
    operationName: 'ListItems',
    query: '',
    variables: { filter: 'a' },
  });

  await handler()?.(route);

  expect(fulfilled).toEqual([{ data: { items: [{ id: '1' }] } }]);
  expect(handle.calls).toEqual([{ filter: 'a' }]);
  await registry.dispose();
});

test('the last mock answers and remove() gives the earlier one back', async () => {
  const { registry, handler } = createRegistry();
  await registry.mock('ListItems', { data: { items: ['first'] } });
  const second = await registry.mock('ListItems', {
    data: { items: ['second'] },
  });
  const call = () => createFakeRoute({ operationName: 'ListItems', query: '' });

  const before = call();
  await handler()?.(before.route);
  expect(before.fulfilled).toEqual([{ data: { items: ['second'] } }]);

  second.remove();
  const after = call();
  await handler()?.(after.route);
  expect(after.fulfilled).toEqual([{ data: { items: ['first'] } }]);
  await registry.dispose();
});

test('times removes the mock after that many answers', async () => {
  const { registry, handler } = createRegistry();
  await registry.mock('ListItems', { data: { items: ['always'] } });
  await registry.mock('ListItems', { data: { items: ['once'] } }, { times: 1 });
  const call = () => createFakeRoute({ operationName: 'ListItems', query: '' });

  const first = call();
  await handler()?.(first.route);
  const second = call();
  await handler()?.(second.route);

  expect(first.fulfilled).toEqual([{ data: { items: ['once'] } }]);
  expect(second.fulfilled).toEqual([{ data: { items: ['always'] } }]);
  await registry.dispose();
});

test('a resolver receives the call and may be async', async () => {
  const { registry, handler } = createRegistry();
  const resolver = vi.fn(
    ({
      variables,
    }: {
      operationName: string;
      variables: Record<string, unknown>;
    }) => Promise.resolve({ data: { createItem: { name: variables.name } } }),
  );
  await registry.mock('CreateItem', resolver);
  const { route, fulfilled } = createFakeRoute({
    operationName: 'CreateItem',
    query: '',
    variables: { name: 'Delta' },
  });

  await handler()?.(route);

  expect(resolver).toHaveBeenCalledWith({
    operationName: 'CreateItem',
    variables: { name: 'Delta' },
  });
  expect(fulfilled).toEqual([{ data: { createItem: { name: 'Delta' } } }]);
  await registry.dispose();
});

test('a resolver exception answers with an error and dispose rethrows it', async () => {
  const { registry, handler } = createRegistry();
  const failure = new Error('resolver broke');
  await registry.mock('CreateItem', () => {
    throw failure;
  });
  const { route, fulfilled } = createFakeRoute({
    operationName: 'CreateItem',
    query: '',
  });

  await handler()?.(route);

  expect(fulfilled).toEqual([{ errors: [{ message: 'resolver broke' }] }]);
  await expect(registry.dispose()).rejects.toBe(failure);
});

test('an unmocked operation gets an error answer and dispose lists the names', async () => {
  const { registry, handler, unrouted } = createRegistry();
  await registry.mock('ItemCount', { data: { itemCount: 0 } });
  const { route, fulfilled } = createFakeRoute({
    operationName: 'ListItems',
    query: '',
  });

  await handler()?.(route);
  await handler()?.(
    createFakeRoute({ operationName: 'Other', query: '' }).route,
  );

  expect(fulfilled).toEqual([
    { errors: [{ message: 'No mock for GraphQL operation "ListItems"' }] },
  ]);
  await expect(registry.dispose()).rejects.toThrow(
    'GraphQL operations without a mock: ListItems, Other. Register them with graphql.mock() or set the graphqlUnmocked option to "passthrough".',
  );
  expect(unrouted).toHaveLength(1);
});

test('passthrough lets an unmocked request continue', async () => {
  const { registry, handler } = createRegistry('passthrough');
  await registry.mock('ItemCount', { data: { itemCount: 0 } });
  const single = createFakeRoute({ operationName: 'ListItems', query: '' });
  const batched = createFakeRoute([
    { operationName: 'ItemCount', query: '' },
    { operationName: 'ListItems', query: '' },
  ]);

  await handler()?.(single.route);
  await handler()?.(batched.route);

  expect(single.fellBack()).toBe(true);
  expect(batched.fellBack()).toBe(true);
  expect(batched.fulfilled).toEqual([]);
  await registry.dispose();
});

test('a batched request gets an array answer, item by item', async () => {
  const { registry, handler } = createRegistry();
  await registry.mock('ListItems', { data: { items: [] } });
  const { route, fulfilled } = createFakeRoute([
    { operationName: 'ListItems', query: '' },
    { operationName: 'ItemCount', query: '' },
  ]);

  await handler()?.(route);

  expect(fulfilled).toEqual([
    [
      { data: { items: [] } },
      { errors: [{ message: 'No mock for GraphQL operation "ItemCount"' }] },
    ],
  ]);
  await expect(registry.dispose()).rejects.toThrow('ItemCount');
});

test('a GET request is answered from its search parameters', async () => {
  const { registry, handler } = createRegistry();
  const handle = await registry.mock('ListItems', { data: { items: [] } });
  const { route, fulfilled } = createFakeRoute(
    '?operationName=ListItems&variables=%7B%22filter%22%3A%22a%22%7D',
    {
      method: 'GET',
    },
  );

  await handler()?.(route);

  expect(fulfilled).toEqual([{ data: { items: [] } }]);
  expect(handle.calls).toEqual([{ filter: 'a' }]);
  await registry.dispose();
});

test('a request it cannot read falls through and records nothing', async () => {
  const { registry, handler } = createRegistry();
  await registry.mock('ListItems', { data: { items: [] } });
  const multipart = createFakeRoute(
    {},
    { contentType: 'multipart/form-data; boundary=x' },
  );

  await handler()?.(multipart.route);

  expect(multipart.fellBack()).toBe(true);
  await registry.dispose();
});

test('delay waits before answering', async () => {
  vi.useFakeTimers();
  const { registry, handler } = createRegistry();
  await registry.mock('ListItems', { data: { items: [] } }, { delay: 500 });
  const { route, fulfilled } = createFakeRoute({
    operationName: 'ListItems',
    query: '',
  });

  const answering = handler()?.(route);
  await vi.advanceTimersByTimeAsync(499);
  expect(fulfilled).toEqual([]);
  await vi.advanceTimersByTimeAsync(1);
  await answering;

  expect(fulfilled).toHaveLength(1);
  await registry.dispose();
});

test('waitForCall resolves with the next call, or at once with the last one', async () => {
  const { registry, handler } = createRegistry();
  const handle = await registry.mock('CreateItem', { data: {} });
  const call = (name: string) =>
    createFakeRoute({
      operationName: 'CreateItem',
      query: '',
      variables: { name },
    });

  const next = handle.waitForCall();
  await handler()?.(call('first').route);
  await expect(next).resolves.toEqual({ name: 'first' });

  await handler()?.(call('second').route);
  await expect(handle.waitForCall()).resolves.toEqual({ name: 'second' });
  await registry.dispose();
});

test('waitForCall rejects after the timeout', async () => {
  vi.useFakeTimers();
  const { registry } = createRegistry();
  const handle = await registry.mock('CreateItem', { data: {} });

  const waiting = handle.waitForCall({ timeout: 200 });
  await vi.advanceTimersByTimeAsync(200);

  await expect(waiting).rejects.toThrow(
    'No call to GraphQL operation "CreateItem" within 200ms.',
  );
  await registry.dispose();
});
