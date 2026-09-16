import type { Response } from '@playwright/test';
import { expect, test } from 'vitest';
import { waitForOperation } from './wait';

type WaitablePage = Parameters<typeof waitForOperation>[0];

const matchesEndpoint = (url: URL) => url.pathname === '/graphql';

function createFakeResponse(body: unknown, operations: unknown) {
  const response = {
    request: () => ({
      method: () => 'POST',
      url: () => 'http://localhost:8080/graphql',
      headers: () => ({ 'content-type': 'application/json' }),
      postData: () => JSON.stringify(operations),
    }),
    status: () => 200,
    json: () => Promise.resolve(body),
  };

  return response as unknown as Response;
}

function createFakePage(waitForResponse: WaitablePage['waitForResponse']) {
  return { waitForResponse } as WaitablePage;
}

test('a rejection that is not a timeout keeps its error', async () => {
  const failure = new TypeError(
    "Cannot read properties of undefined (reading 'path')",
  );
  const page = createFakePage(() => Promise.reject(failure));

  await expect(
    waitForOperation(page, matchesEndpoint, 'ListItems'),
  ).rejects.toBe(failure);
});

test('a timeout names the operation and the timeout', async () => {
  const timeout = new Error('Timeout 250ms exceeded.');
  timeout.name = 'TimeoutError';
  const page = createFakePage(() => Promise.reject(timeout));

  await expect(
    waitForOperation(page, matchesEndpoint, 'ListItems', { timeout: 250 }),
  ).rejects.toThrow(
    'No response for GraphQL operation "ListItems" within 250ms.',
  );
});

test('a batched response gives the item of the operation', async () => {
  const response = createFakeResponse(
    [{ data: { itemCount: 2 } }, { data: { items: [] } }],
    [
      { operationName: 'ItemCount', query: '' },
      { operationName: 'ListItems', query: '' },
    ],
  );
  const page = createFakePage((predicate) => {
    expect(predicate(response)).toBe(true);
    return Promise.resolve(response);
  });

  const result = await waitForOperation(page, matchesEndpoint, 'ListItems');

  expect(result).toEqual({ data: { items: [] }, errors: undefined, response });
});

test('a batched request answered with a single body gives no data', async () => {
  const response = createFakeResponse({ data: { items: [] } }, [
    { operationName: 'ListItems', query: '' },
  ]);
  const page = createFakePage((predicate) => {
    predicate(response);
    return Promise.resolve(response);
  });

  const result = await waitForOperation(page, matchesEndpoint, 'ListItems');

  expect(result.data).toBeUndefined();
});
