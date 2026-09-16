import { expect, test } from 'vitest';
import { readOperations } from './request-body';

function postRequest(body: string | null, contentType = 'application/json') {
  return {
    method: () => 'POST',
    url: () => 'http://localhost:8080/graphql',
    headers: () => ({ 'content-type': contentType }),
    postData: () => body,
  };
}

function getRequest(search: string) {
  return {
    method: () => 'GET',
    url: () => `http://localhost:8080/graphql${search}`,
    headers: () => ({}),
    postData: () => null,
  };
}

test('reads one operation from a JSON object body', () => {
  const request = postRequest(
    JSON.stringify({
      operationName: 'ListItems',
      query: 'query ListItems { items { id } }',
      variables: { filter: 'a' },
    }),
  );

  expect(readOperations(request)).toEqual({
    operations: [{ operationName: 'ListItems', variables: { filter: 'a' } }],
    isBatched: false,
  });
});

test('variables default to an empty object', () => {
  const request = postRequest(
    JSON.stringify({ operationName: 'ListItems', query: '' }),
  );

  expect(readOperations(request)?.operations[0]?.variables).toEqual({});
});

test('reads every operation of an array body', () => {
  const request = postRequest(
    JSON.stringify([
      { operationName: 'ListItems', query: '' },
      { operationName: 'ItemCount', query: '', variables: { since: 1 } },
    ]),
  );

  expect(readOperations(request)).toEqual({
    operations: [
      { operationName: 'ListItems', variables: {} },
      { operationName: 'ItemCount', variables: { since: 1 } },
    ],
    isBatched: true,
  });
});

test('reads a GET request from its search parameters', () => {
  const search = `?operationName=ListItems&variables=${encodeURIComponent(JSON.stringify({ filter: 'a' }))}`;

  expect(readOperations(getRequest(search))).toEqual({
    operations: [{ operationName: 'ListItems', variables: { filter: 'a' } }],
    isBatched: false,
  });
  expect(
    readOperations(getRequest('?operationName=ListItems'))?.operations[0]
      ?.variables,
  ).toEqual({});
});

test('gives undefined for what it cannot read', () => {
  expect(
    readOperations(postRequest('{}', 'multipart/form-data; boundary=x')),
  ).toBeUndefined();
  expect(readOperations(postRequest('not json'))).toBeUndefined();
  expect(readOperations(postRequest(null))).toBeUndefined();
  expect(
    readOperations(postRequest(JSON.stringify({ query: '{ items { id } }' }))),
  ).toBeUndefined();
  expect(
    readOperations(
      postRequest(JSON.stringify([{ operationName: 'A' }, { query: '' }])),
    ),
  ).toBeUndefined();
  expect(readOperations(postRequest(JSON.stringify([])))).toBeUndefined();
  expect(readOperations(getRequest('?variables=%7B%7D'))).toBeUndefined();
  expect(
    readOperations(getRequest('?operationName=A&variables=not-json')),
  ).toBeUndefined();
  expect(
    readOperations({ ...postRequest('{}'), method: () => 'PUT' }),
  ).toBeUndefined();
});
