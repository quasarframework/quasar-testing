import { expect, test } from 'vitest';
import { readGraphqlResult } from './response';

test('reads data and errors', () => {
  expect(readGraphqlResult({ data: { items: [] } })).toEqual({
    data: { items: [] },
    errors: undefined,
  });
  expect(
    readGraphqlResult({ data: null, errors: [{ message: 'Boom' }] }),
  ).toEqual({
    data: null,
    errors: [{ message: 'Boom' }],
  });
});

test('an empty errors array counts as no errors', () => {
  expect(readGraphqlResult({ data: {}, errors: [] }).errors).toBeUndefined();
});

test('anything that is not a GraphQL body gives undefined for both', () => {
  expect(readGraphqlResult('text')).toEqual({
    data: undefined,
    errors: undefined,
  });
  expect(readGraphqlResult(null)).toEqual({
    data: undefined,
    errors: undefined,
  });
  expect(readGraphqlResult({ errors: 'oops' })).toEqual({
    data: undefined,
    errors: undefined,
  });
});
