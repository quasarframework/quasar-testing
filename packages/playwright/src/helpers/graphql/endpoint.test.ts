import { expect, test } from 'vitest';
import { createEndpointMatcher, resolveApiUrl } from './endpoint';

test('a pathname matches on any origin', () => {
  const matches = createEndpointMatcher('/graphql');

  expect(matches(new URL('http://localhost:8080/graphql'))).toBe(true);
  expect(
    matches(new URL('https://api.example.com/graphql?operationName=A')),
  ).toBe(true);
  expect(matches(new URL('http://localhost:8080/graphql/v2'))).toBe(false);
  expect(matches(new URL('http://localhost:8080/api'))).toBe(false);
});

test('a pathname without a leading slash gets one', () => {
  expect(
    createEndpointMatcher('graphql')(new URL('http://localhost:8080/graphql')),
  ).toBe(true);
});

test('an absolute URL matches its origin and pathname', () => {
  const matches = createEndpointMatcher('https://api.example.com/graphql');

  expect(matches(new URL('https://api.example.com/graphql'))).toBe(true);
  expect(matches(new URL('http://localhost:8080/graphql'))).toBe(false);
});

test('a string with a scheme that is not http is refused', () => {
  const message =
    'The graphqlEndpoint option "localhost:8080/graphql" is neither an absolute http URL nor a pathname.';

  expect(() => createEndpointMatcher('localhost:8080/graphql')).toThrow(
    message,
  );
  expect(() =>
    resolveApiUrl(
      'localhost:8080/graphql',
      undefined,
      'http://localhost:8080/',
    ),
  ).toThrow(message);
});

test('a RegExp tests the href', () => {
  const matches = createEndpointMatcher(/\/api\/(graphql|gql)$/);

  expect(matches(new URL('http://localhost:8080/api/gql'))).toBe(true);
  expect(matches(new URL('http://localhost:8080/api/rest'))).toBe(false);
});

test('a RegExp with the global flag matches the same URL every time', () => {
  const matches = createEndpointMatcher(/\/graphql/g);
  const url = new URL('http://localhost:8080/graphql');

  expect(matches(url)).toBe(true);
  expect(matches(url)).toBe(true);
  expect(matches(url)).toBe(true);
});

test('a predicate is used as it is', () => {
  const predicate = (url: URL) => url.port === '4000';

  expect(createEndpointMatcher(predicate)).toBe(predicate);
});

test('resolveApiUrl prefers the explicit API URL', () => {
  expect(
    resolveApiUrl(
      '/graphql',
      'https://api.example.com/graphql',
      'http://localhost:8080/',
    ),
  ).toBe('https://api.example.com/graphql');
});

test('resolveApiUrl keeps an absolute endpoint', () => {
  expect(
    resolveApiUrl('https://api.example.com/graphql', undefined, undefined),
  ).toBe('https://api.example.com/graphql');
});

test('resolveApiUrl joins a pathname to the baseURL', () => {
  expect(resolveApiUrl('/graphql', undefined, 'http://localhost:8080/')).toBe(
    'http://localhost:8080/graphql',
  );
});

test('resolveApiUrl throws when it has nothing to join a pathname to', () => {
  expect(() => resolveApiUrl('/graphql', undefined, undefined)).toThrow(
    'graphql.execute() needs a baseURL to resolve the endpoint "/graphql", or the graphqlApiUrl option.',
  );
});

test('resolveApiUrl throws for a RegExp or a predicate without an API URL', () => {
  const message =
    'graphql.execute() needs the graphqlApiUrl option when graphqlEndpoint is a RegExp or a function.';

  expect(() =>
    resolveApiUrl(/graphql/, undefined, 'http://localhost:8080/'),
  ).toThrow(message);
  expect(() =>
    resolveApiUrl(() => true, undefined, 'http://localhost:8080/'),
  ).toThrow(message);
});
