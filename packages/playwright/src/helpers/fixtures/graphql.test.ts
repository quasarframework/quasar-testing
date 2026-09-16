import type { Page } from '@playwright/test';
import { parse } from 'graphql';
import { expect, test } from 'vitest';
import { createGraphqlFixture } from './graphql';

type RouteHandler = unknown;

interface Post {
  url: string;
  options: { data: unknown; headers: Record<string, string> };
}

function createFakePage(body: unknown = { data: { items: [] } }) {
  const routed: RouteHandler[] = [];
  const unrouted: RouteHandler[] = [];
  const posts: Post[] = [];

  const page = {
    route: (_url: unknown, handler: RouteHandler) => {
      routed.push(handler);
      return Promise.resolve();
    },
    unroute: (_url: unknown, handler: RouteHandler) => {
      unrouted.push(handler);
      return Promise.resolve();
    },
    isClosed: () => false,
    request: {
      post: (url: string, options: Post['options']) => {
        posts.push({ url, options });

        return Promise.resolve({
          ok: () => true,
          status: () => 200,
          json: () => Promise.resolve(body),
          text: () => Promise.resolve(JSON.stringify(body)),
        });
      },
    },
  };

  return { page: page as unknown as Page, routed, unrouted, posts };
}

const ListItems = parse('query ListItems { items { id } }');

test('the fixture exposes every helper', () => {
  const { page } = createFakePage();

  const graphql = createGraphqlFixture(page);

  expect(typeof graphql.mock).toBe('function');
  expect(typeof graphql.waitForOperation).toBe('function');
  expect(typeof graphql.execute).toBe('function');
  expect(typeof graphql.dispose).toBe('function');
});

test('dispose removes the route the mocks installed', async () => {
  const { page, routed, unrouted } = createFakePage();
  const graphql = createGraphqlFixture(page);

  await graphql.mock('ListItems', { data: { items: [] } });
  await graphql.dispose();

  expect(routed).toHaveLength(1);
  expect(unrouted).toEqual(routed);
});

test('dispose reports what the registry recorded', async () => {
  const { page, routed } = createFakePage();
  const graphql = createGraphqlFixture(page);
  await graphql.mock('ItemCount', { data: { itemCount: 0 } });
  const handler = routed[0] as (route: unknown) => Promise<void>;

  await handler({
    request: () => ({
      method: () => 'POST',
      url: () => 'http://localhost:8080/graphql',
      headers: () => ({ 'content-type': 'application/json' }),
      postData: () => JSON.stringify({ operationName: 'ListItems', query: '' }),
    }),
    fulfill: () => Promise.resolve(),
    fallback: () => Promise.resolve(),
  });

  await expect(graphql.dispose()).rejects.toThrow(
    'GraphQL operations without a mock: ListItems',
  );
});

test('execute posts through the page with the default headers', async () => {
  const { page, posts } = createFakePage({ data: { items: [{ id: '1' }] } });
  const graphql = createGraphqlFixture(page, {
    graphqlHeaders: { authorization: 'Bearer default' },
    baseURL: 'http://localhost:8080/',
  });

  const data = await graphql.execute(ListItems);

  expect(data).toEqual({ items: [{ id: '1' }] });
  expect(posts).toEqual([
    {
      url: 'http://localhost:8080/graphql',
      options: {
        data: {
          operationName: 'ListItems',
          query: 'query ListItems {\n  items {\n    id\n  }\n}',
          variables: {},
        },
        headers: { authorization: 'Bearer default' },
      },
    },
  ]);
});

test('execute posts an empty headers object when there are none', async () => {
  const { page, posts } = createFakePage();
  const graphql = createGraphqlFixture(page, {
    baseURL: 'http://localhost:8080/',
  });

  await graphql.execute(ListItems);

  expect(posts[0]?.options.headers).toEqual({});
});
